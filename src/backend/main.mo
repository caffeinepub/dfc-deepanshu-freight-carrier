import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import OutCall "http-outcalls/outcall";
import Migration "migration";

(with migration = Migration.run)
actor {
  // Data Models
  type Coordinates = {
    latitude : Float;
    longitude : Float;
  };

  type Shipment = {
    trackingID : Text;
    status : Text;
    location : Text;
    client : Principal;
    coordinates : ?Coordinates;
  };

  type Invoice = {
    invoiceNo : Nat;
    amount : Nat;
    status : InvoiceStatus;
    dueDate : Time.Time;
    client : Principal;
  };

  type Client = {
    id : Principal;
    companyName : Text;
    gstNumber : Text;
    address : Text;
    mobile : Text;
  };

  type Payment = {
    id : Nat;
    invoiceNo : Nat;
    amount : Nat;
    status : ?PaymentStatus;
    paymentIntent : ?StripePaymentIntent;
    receipts : [Text];
  };

  type PaymentStatus = {
    #pending;
    #complete;
    #failed : Text;
  };

  type StripePaymentIntent = {
    intentId : Text;
    clientSecret : Text;
    amount : Nat;
    currency : Text;
    status : Text;
  };

  type InvoiceStatus = {
    #paid;
    #pending;
    #overdue;
  };

  type ClientRole = {
    #client;
    #admin;
  };

  type ClientAccount = {
    identifier : Text;
    email : ?Text;
    mobile : ?Text;
    password : Text;
    profile : UserProfile;
    isFirstLogin : Bool;
    activeSessionToken : ?Text;
    role : ClientRole;
    createdAt : Time.Time;
  };

  type UserProfile = {
    companyName : Text;
    gstNumber : Text;
    address : Text;
    mobile : Text;
  };

  type ClientSession = {
    clientId : Text;
    sessionToken : Text;
    expiration : Time.Time;
  };

  // Persistent Storage
  let shipments = Map.empty<Text, Shipment>();
  let invoices = Map.empty<Nat, Invoice>();
  let clients = Map.empty<Principal, Client>();
  let payments = Map.empty<Nat, Payment>();
  let clientAccounts = Map.empty<Text, ClientAccount>();
  let clientSessions = Map.empty<Text, ClientSession>();

  // Authorization System State (component)
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // MSG91 API Key Storage (persistent)
  var msg91ApiKey : ?Text = null;

  // Admin Authentication State
  var adminPassword = "JATINSHARMA2356";
  let adminSessionTokens = Map.empty<Text, Time.Time>();
  let sessionTimeout : Int = 30 * 60 * 1_000_000_000; // 30 minutes in nanoseconds

  // Rate Limiting for Login Attempts (both admin and client)
  let loginAttempts = Map.empty<Text, (Nat, Time.Time)>(); // identifier -> (attempts, lastAttempt)
  let maxLoginAttempts : Nat = 5;
  let loginAttemptWindow : Int = 15 * 60 * 1_000_000_000; // 15 minutes

  // OTP Rate Limiting
  let otpAttempts = Map.empty<Text, (Nat, Time.Time)>(); // phone -> (attempts, lastAttempt)
  let maxOtpAttempts : Nat = 3;
  let otpAttemptWindow : Int = 5 * 60 * 1_000_000_000; // 5 minutes

  // Client Session Timeout
  let clientSessionTimeout : Int = 60 * 60 * 1_000_000_000; // 1 hour

  func checkRateLimit(identifier : Text) : Bool {
    let now = Time.now();
    switch (loginAttempts.get(identifier)) {
      case (null) {
        loginAttempts.add(identifier, (1, now));
        true;
      };
      case (?(attempts, lastAttempt)) {
        if ((now - lastAttempt) > loginAttemptWindow) {
          // Reset counter after window expires
          loginAttempts.add(identifier, (1, now));
          true;
        } else if (attempts >= maxLoginAttempts) {
          false;
        } else {
          loginAttempts.add(identifier, (attempts + 1, now));
          true;
        };
      };
    };
  };

  func checkOtpRateLimit(phoneNumber : Text) : Bool {
    let now = Time.now();
    switch (otpAttempts.get(phoneNumber)) {
      case (null) {
        otpAttempts.add(phoneNumber, (1, now));
        true;
      };
      case (?(attempts, lastAttempt)) {
        if ((now - lastAttempt) > otpAttemptWindow) {
          otpAttempts.add(phoneNumber, (1, now));
          true;
        } else if (attempts >= maxOtpAttempts) {
          false;
        } else {
          otpAttempts.add(phoneNumber, (attempts + 1, now));
          true;
        };
      };
    };
  };

  func isValidSession(token : Text) : Bool {
    switch (adminSessionTokens.get(token)) {
      case (null) { false };
      case (?timestamp) {
        let currentTime = Time.now();
        if ((currentTime - timestamp) > sessionTimeout) {
          adminSessionTokens.remove(token);
          false;
        } else {
          // Refresh session timestamp on activity
          adminSessionTokens.add(token, currentTime);
          true;
        };
      };
    };
  };

  func isValidClientSession(sessionToken : Text) : ?Text {
    switch (clientSessions.get(sessionToken)) {
      case (null) { null };
      case (?session) {
        let currentTime = Time.now();
        if ((currentTime - session.expiration) > 0) {
          clientSessions.remove(sessionToken);
          null;
        } else {
          // Refresh session expiration on activity
          let refreshedSession = {
            session with
            expiration = currentTime + clientSessionTimeout;
          };
          clientSessions.add(sessionToken, refreshedSession);
          ?session.clientId;
        };
      };
    };
  };

  func getClientIdFromSession(sessionToken : Text) : Text {
    switch (isValidClientSession(sessionToken)) {
      case (null) {
        Runtime.trap("Invalid or expired client session token");
      };
      case (?clientId) { clientId };
    };
  };

  func normalizeIdentifier(text : Text) : Text {
    text.trim(#predicate(func(c) { c == ' ' }));
  };

  func emailExists(email : Text) : Bool {
    let normalizedEmail = normalizeIdentifier(email);
    for ((_, account) in clientAccounts.entries()) {
      switch (account.email) {
        case (?existingEmail) {
          if (Text.equal(normalizeIdentifier(existingEmail), normalizedEmail)) {
            return true;
          };
        };
        case (null) {};
      };
    };
    false;
  };

  func mobileExists(mobile : Text) : Bool {
    let normalizedMobile = normalizeIdentifier(mobile);
    for ((_, account) in clientAccounts.entries()) {
      switch (account.mobile) {
        case (?existingMobile) {
          if (Text.equal(normalizeIdentifier(existingMobile), normalizedMobile)) {
            return true;
          };
        };
        case (null) {};
      };
    };
    false;
  };

  public query ({ caller }) func isMsg91ApiKeyStored() : async Bool {
    switch (msg91ApiKey) {
      case (null) { false };
      case (?apiKey) { not Text.equal(apiKey, "") };
    };
  };

  public shared ({ caller }) func storeMsg91ApiKey(apiKey : Text, adminToken : Text) : async () {
    if (not isValidSession(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    if (Text.equal(apiKey, "")) {
      Runtime.trap("Invalid API key: API key cannot be empty");
    };
    msg91ApiKey := ?apiKey;
  };

  public shared ({ caller }) func verifyMsg91AccessToken(jwtToken : Text, adminToken : Text) : async (Bool, Text, Nat) {
    if (not isValidSession(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };

    switch (msg91ApiKey) {
      case (null) {
        Runtime.trap("MSG91 API key not configured. Please contact admin.");
      };
      case (?apiKey) {
        let url = "https://control.msg91.com/api/v5/widget/verifyAccessToken";
        let requestBody = "{\"authkey\":\"" # apiKey # "\",\"access-token\":\"" # jwtToken # "\"}";
        let extraHeaders = [{ name = "Content-Type"; value = "application/json" }];
        let rawResponse = await OutCall.httpPostRequest(url, extraHeaders, requestBody, transform);

        let isSuccess = rawResponse.contains(#text "\"type\":\"success\"");
        let statusCode = if (isSuccess) { 200 } else { 401 };

        (isSuccess, rawResponse, statusCode);
      };
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query ({ caller }) func trackShipment(trackingID : Text, adminToken : ?Text, clientSessionToken : ?Text) : async ?Shipment {
    switch (shipments.get(trackingID)) {
      case (?shipment) {
        // Admin can view any shipment
        switch (adminToken) {
          case (?token) {
            if (not isValidSession(token)) {
              Runtime.trap("Unauthorized: Invalid admin token");
            };
            return ?shipment;
          };
          case (null) {};
        };

        // Client can view their own shipment via session token
        switch (clientSessionToken) {
          case (?token) {
            let clientId = getClientIdFromSession(token);
            if (shipment.client.toText() != clientId) {
              Runtime.trap("Unauthorized: Can only track your own shipments");
            };
            return ?shipment;
          };
          case (null) {};
        };

        // Fallback to caller-based authorization
        if (caller.isAnonymous()) {
          Runtime.trap("Unauthorized: Authentication required to track shipments");
        };
        if (caller != shipment.client) {
          Runtime.trap("Unauthorized: Can only track your own shipments");
        };
        ?shipment;
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func adminLogin(password : Text, token : Text) : async Text {
    let callerText = caller.toText();

    if (not checkRateLimit(callerText)) {
      Runtime.trap("Too many login attempts. Please try again later.");
    };

    if (password != adminPassword) {
      Runtime.trap("Invalid password");
    };

    loginAttempts.remove(callerText);
    adminSessionTokens.add(token, Time.now());
    token;
  };

  public shared ({ caller }) func adminLogout(token : Text) : async Bool {
    switch (adminSessionTokens.get(token)) {
      case (null) { false };
      case (?_) {
        adminSessionTokens.remove(token);
        true;
      };
    };
  };

  public shared ({ caller }) func changeAdminPassword(token : Text, oldPassword : Text, newPassword : Text) : async () {
    if (not isValidSession(token)) {
      Runtime.trap("Invalid session token");
    };

    if (oldPassword != adminPassword) {
      Runtime.trap("Invalid current password");
    };

    if (newPassword.size() < 8) {
      Runtime.trap("New password must be at least 8 characters long");
    };

    adminPassword := newPassword;

    for ((sessionToken, _) in adminSessionTokens.entries()) {
      adminSessionTokens.remove(sessionToken);
    };
  };

  public shared ({ caller }) func createShipment(
    trackingID : Text,
    status : Text,
    location : Text,
    coordinates : ?Coordinates,
    client : Principal,
    adminToken : Text,
  ) : async Bool {
    if (not isValidSession(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };

    let newShipment : Shipment = {
      trackingID;
      status;
      location;
      coordinates;
      client;
    };

    shipments.add(trackingID, newShipment);
    true;
  };

  public query ({ caller }) func getShipment(trackingID : Text, adminToken : ?Text, clientSessionToken : ?Text) : async ?Shipment {
    switch (shipments.get(trackingID)) {
      case (?shipment) {
        // Admin can view any shipment
        switch (adminToken) {
          case (?token) {
            if (not isValidSession(token)) {
              Runtime.trap("Unauthorized: Invalid admin token");
            };
            return ?shipment;
          };
          case (null) {};
        };

        // Client can view their own shipment via session token
        switch (clientSessionToken) {
          case (?token) {
            let clientId = getClientIdFromSession(token);
            if (shipment.client.toText() != clientId) {
              Runtime.trap("Unauthorized: Can only view your own shipments");
            };
            return ?shipment;
          };
          case (null) {};
        };

        // Fallback to caller-based authorization
        if (caller.isAnonymous()) {
          Runtime.trap("Unauthorized: Authentication required to view shipments");
        };
        if (caller != shipment.client) {
          Runtime.trap("Unauthorized: Can only view your own shipments");
        };
        ?shipment;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getShipmentsByClient(client : Principal, adminToken : ?Text, clientSessionToken : ?Text) : async [Shipment] {
    switch (adminToken) {
      case (?token) {
        if (not isValidSession(token)) {
          Runtime.trap("Unauthorized: Invalid admin token");
        };
        return shipments.values().toArray().filter(func(shipment) { shipment.client == client });
      };
      case (null) {};
    };

    switch (clientSessionToken) {
      case (?token) {
        let clientId = getClientIdFromSession(token);
        if (client.toText() != clientId) {
          Runtime.trap("Unauthorized: Can only view your own shipments");
        };
        return shipments.values().toArray().filter(func(shipment) { shipment.client == client });
      };
      case (null) {};
    };

    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous principals cannot view shipments");
    };
    if (caller != client) {
      Runtime.trap("Unauthorized: Can only view your own shipments");
    };

    shipments.values().toArray().filter(func(shipment) { shipment.client == client });
  };

  // New function to fetch all shipments for map display
  public query ({ caller }) func getAllShipmentsForMap(adminToken : Text) : async [Shipment] {
    if (not isValidSession(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    shipments.values().toArray();
  };

  public shared ({ caller }) func createInvoice(
    invoiceNo : Nat,
    amount : Nat,
    dueDate : Time.Time,
    client : Principal,
    adminToken : Text,
  ) : async Bool {
    if (not isValidSession(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };

    let newInvoice : Invoice = {
      invoiceNo;
      amount;
      status = #pending;
      dueDate;
      client;
    };

    invoices.add(invoiceNo, newInvoice);
    true;
  };

  public query ({ caller }) func getInvoice(invoiceNo : Nat, adminToken : ?Text, clientSessionToken : ?Text) : async ?Invoice {
    switch (invoices.get(invoiceNo)) {
      case (?invoice) {
        switch (adminToken) {
          case (?token) {
            if (not isValidSession(token)) {
              Runtime.trap("Unauthorized: Invalid admin token");
            };
            return ?invoice;
          };
          case (null) {};
        };

        switch (clientSessionToken) {
          case (?token) {
            let clientId = getClientIdFromSession(token);
            if (invoice.client.toText() != clientId) {
              Runtime.trap("Unauthorized: Can only view your own invoices");
            };
            return ?invoice;
          };
          case (null) {};
        };

        if (caller.isAnonymous()) {
          Runtime.trap("Unauthorized: Anonymous principals cannot view invoices");
        };
        if (invoice.client != caller) {
          Runtime.trap("Unauthorized: Can only view your own invoices");
        };
        ?invoice;
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getInvoicesByClient(client : Principal, adminToken : ?Text, clientSessionToken : ?Text) : async [Invoice] {
    switch (adminToken) {
      case (?token) {
        if (not isValidSession(token)) {
          Runtime.trap("Unauthorized: Invalid admin token");
        };
        return invoices.values().toArray().filter(func(invoice) { invoice.client == client });
      };
      case (null) {};
    };

    switch (clientSessionToken) {
      case (?token) {
        let clientId = getClientIdFromSession(token);
        if (client.toText() != clientId) {
          Runtime.trap("Unauthorized: Can only view your own invoices");
        };
        return invoices.values().toArray().filter(func(invoice) { invoice.client == client });
      };
      case (null) {};
    };

    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous principals cannot view invoices");
    };
    if (caller != client) {
      Runtime.trap("Unauthorized: Can only view your own invoices");
    };

    invoices.values().toArray().filter(func(invoice) { invoice.client == client });
  };

  // New function to fetch revenue data for chart
  public query ({ caller }) func getRevenueData(adminToken : Text) : async [(Time.Time, Nat)] {
    if (not isValidSession(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };

    var revenueData = Map.empty<Time.Time, Nat>();

    for ((_, invoice) in invoices.entries()) {
      let amount = switch (invoice.status) {
        case (#paid) { invoice.amount };
        case (#pending) { 0 };
        case (#overdue) { 0 };
      };

      let existingAmount = switch (revenueData.get(invoice.dueDate)) {
        case (null) { 0 };
        case (?value) { value };
      };

      revenueData.add(invoice.dueDate, existingAmount + amount);
    };

    revenueData.toArray();
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous principals cannot view profiles");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    switch (clients.get(caller)) {
      case (?client) {
        ?{
          companyName = client.companyName;
          gstNumber = client.gstNumber;
          address = client.address;
          mobile = client.mobile;
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal, adminToken : ?Text) : async ?UserProfile {
    switch (adminToken) {
      case (?token) {
        if (not isValidSession(token)) {
          Runtime.trap("Unauthorized: Invalid admin token");
        };
      };
      case (null) {
        if (caller.isAnonymous()) {
          Runtime.trap("Unauthorized: Anonymous principals cannot view profiles");
        };
        if (caller != user) {
          Runtime.trap("Unauthorized: Can only view your own profile");
        };
      };
    };

    switch (clients.get(user)) {
      case (?client) {
        ?{
          companyName = client.companyName;
          gstNumber = client.gstNumber;
          address = client.address;
          mobile = client.mobile;
        };
      };
      case (null) { null };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous principals cannot save profiles");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    let newClient : Client = {
      id = caller;
      companyName = profile.companyName;
      gstNumber = profile.gstNumber;
      address = profile.address;
      mobile = profile.mobile;
    };
    clients.add(caller, newClient);
  };

  public shared ({ caller }) func adminAddOrUpdateClient(clientId : Principal, profile : UserProfile, adminToken : Text) : async () {
    if (not isValidSession(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };

    let newClient : Client = {
      id = clientId;
      companyName = profile.companyName;
      gstNumber = profile.gstNumber;
      address = profile.address;
      mobile = profile.mobile;
    };
    clients.add(clientId, newClient);
  };

  public shared ({ caller }) func addClient(companyName : Text, gstNumber : Text, address : Text, mobile : Text) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous principals cannot add clients");
    };

    let newClient : Client = {
      id = caller;
      companyName;
      gstNumber;
      address;
      mobile;
    };

    clients.add(caller, newClient);
    true;
  };

  public query ({ caller }) func getClient(id : Principal, adminToken : ?Text) : async ?Client {
    switch (adminToken) {
      case (?token) {
        if (not isValidSession(token)) {
          Runtime.trap("Unauthorized: Invalid admin token");
        };
      };
      case (null) {
        if (caller.isAnonymous()) {
          Runtime.trap("Unauthorized: Anonymous principals cannot view clients");
        };
        if (caller != id) {
          Runtime.trap("Unauthorized: Can only view your own profile");
        };
      };
    };

    clients.get(id);
  };

  public query ({ caller }) func getAllClients(adminToken : Text) : async [Client] {
    if (not isValidSession(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    clients.values().toArray();
  };

  public shared ({ caller }) func pay({ invoiceNo : Nat }) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous principals cannot make payments");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only clients can make a payment");
    };

    switch (invoices.get(invoiceNo)) {
      case (?invoice) {
        if (invoice.client != caller) {
          Runtime.trap("Unauthorized: Can only pay your own invoices");
        };
      };
      case (null) {
        Runtime.trap("Invoice not found");
      };
    };

    let paymentId = Time.now().toNat();
    let newPayment : Payment = {
      id = paymentId;
      invoiceNo;
      amount = 1000;
      status = ?#pending;
      paymentIntent = null;
      receipts = [];
    };

    payments.add(paymentId, newPayment);
    true;
  };

  public query ({ caller }) func exportInvoices(adminToken : Text) : async [Text] {
    if (not isValidSession(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    ["invoiceNo,amount,status,dueDate,clientID"];
  };

  public shared ({ caller }) func bootstrapFirstAdmin() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous principals cannot bootstrap admin");
    };
    if (AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Admin already exists");
    };
    AccessControl.assignRole(accessControlState, caller, caller, #admin);
  };

  public query ({ caller }) func isAdminBootstrapped() : async Bool {
    AccessControl.isAdmin(accessControlState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin);
  };

  public shared ({ caller }) func grantAdmin(targetPrincipal : Principal, adminToken : Text) : async () {
    if (not isValidSession(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    AccessControl.assignRole(accessControlState, caller, targetPrincipal, #admin);
  };

  public shared ({ caller }) func revokeAdmin(targetPrincipal : Principal, adminToken : Text) : async () {
    if (not isValidSession(adminToken)) {
      Runtime.trap("Unauthorized: Invalid admin token");
    };
    if (targetPrincipal == caller) {
      Runtime.trap("Cannot revoke own admin privileges. Please use another admin to revoke this role");
    };
    AccessControl.assignRole(accessControlState, caller, targetPrincipal, #user);
  };

  public query ({ caller }) func hasAdminRole(target : Principal, adminToken : ?Text) : async Bool {
    switch (adminToken) {
      case (?token) {
        if (not isValidSession(token)) {
          Runtime.trap("Unauthorized: Invalid admin token");
        };
      };
      case (null) {
        if (not target.isAnonymous() and caller != target) {
          Runtime.trap("Unauthorized: Can only check your own role without admin token");
        };
      };
    };

    AccessControl.isAdmin(accessControlState, target);
  };

  public shared ({ caller }) func sendOtp(phoneNumber : Text) : async (Bool, Text, Nat) {
    if (not checkOtpRateLimit(phoneNumber)) {
      Runtime.trap("Too many OTP requests. Please try again later.");
    };

    switch (msg91ApiKey) {
      case (null) {
        Runtime.trap("MSG91 API key not configured. Please contact admin.");
      };
      case (?apiKey) {
        let url = "https://control.msg91.com/api/v5/otp";
        let requestBody = "{
          \"authkey\":\"" # apiKey # "\",
          \"mobile\":\"91" # phoneNumber # "\",
          \"otp_length\":4,
          \"otp_expiry\":5
        }";
        let extraHeaders = [{ name = "Content-Type"; value = "application/json" }];
        let rawResponse = await OutCall.httpPostRequest(url, extraHeaders, requestBody, transform);

        let isSuccess = rawResponse.contains(#text "\"type\":\"success\"");
        let statusCode = if (isSuccess) { 200 } else { 400 };

        (isSuccess, rawResponse, statusCode);
      };
    };
  };

  public shared ({ caller }) func verifyOtp(phoneNumber : Text, otp : Text) : async (Bool, Text, Nat) {
    if (not checkOtpRateLimit(phoneNumber # "_verify")) {
      Runtime.trap("Too many OTP verification attempts. Please try again later.");
    };

    switch (msg91ApiKey) {
      case (null) {
        Runtime.trap("MSG91 API key not configured. Please contact admin.");
      };
      case (?apiKey) {
        let url = "https://control.msg91.com/api/v5/otp/verify";
        let requestBody = "{
          \"authkey\":\"" # apiKey # "\",
          \"mobile\":\"91" # phoneNumber # "\",
          \"otp\":\"" # otp # "\"
        }";
        let extraHeaders = [{ name = "Content-Type"; value = "application/json" }];
        let rawResponse = await OutCall.httpPostRequest(url, extraHeaders, requestBody, transform);

        let isSuccess = rawResponse.contains(#text "\"type\":\"success\"");
        let statusCode = if (isSuccess) { 200 } else { 401 };

        if (isSuccess) {
          otpAttempts.remove(phoneNumber # "_verify");
        };

        (isSuccess, rawResponse, statusCode);
      };
    };
  };

  public shared ({ caller }) func clientSignup(
    email : Text,
    password : Text,
    profile : UserProfile,
  ) : async Text {
    if (password.size() < 8) {
      Runtime.trap("Password must be at least 8 characters long");
    };

    let normalizedEmail = normalizeIdentifier(email);

    if (emailExists(normalizedEmail)) {
      Runtime.trap("An account with this email already exists");
    };

    let newAccount : ClientAccount = {
      identifier = normalizedEmail;
      email = ?normalizedEmail;
      mobile = ?profile.mobile;
      password = password;
      profile = profile;
      isFirstLogin = false;
      activeSessionToken = null;
      role = #client;
      createdAt = Time.now();
    };

    clientAccounts.add(normalizedEmail, newAccount);

    let sessionToken = Time.now().toText() # "_signup_session_" # normalizedEmail;
    let expiration = Time.now() + clientSessionTimeout;

    let newSession : ClientSession = {
      clientId = normalizedEmail;
      sessionToken = sessionToken;
      expiration = expiration;
    };
    clientSessions.add(sessionToken, newSession);

    let updatedAccount = { newAccount with activeSessionToken = ?sessionToken };
    clientAccounts.add(normalizedEmail, updatedAccount);

    sessionToken;
  };

  public shared ({ caller }) func authenticateClient(emailOrMobile : Text, password : Text) : async ?Text {
    let normalizedInput = normalizeIdentifier(emailOrMobile);

    if (not checkRateLimit(normalizedInput)) {
      Runtime.trap("Too many login attempts. Please try again later.");
    };

    var matchedAccountKey : ?Text = null;
    var matchedAccount : ?ClientAccount = null;

    for ((accountKey, account) in clientAccounts.entries()) {
      if (Text.equal(normalizeIdentifier(account.identifier), normalizedInput)) {
        matchedAccountKey := ?accountKey;
        matchedAccount := ?account;
      } else {
        switch (account.email) {
          case (?email) {
            if (Text.equal(normalizeIdentifier(email), normalizedInput)) {
              matchedAccountKey := ?accountKey;
              matchedAccount := ?account;
            };
          };
          case (null) {};
        };
        switch (account.mobile) {
          case (?mobile) {
            if (Text.equal(normalizeIdentifier(mobile), normalizedInput)) {
              matchedAccountKey := ?accountKey;
              matchedAccount := ?account;
            };
          };
          case (null) {};
        };
      };
    };

    switch (matchedAccountKey, matchedAccount) {
      case (?accountKey, ?account) {
        if (not Text.equal(account.password, password)) {
          Runtime.trap("Invalid email/mobile or password");
        };

        loginAttempts.remove(normalizedInput);

        let sessionToken = Time.now().toText() # "_session_" # accountKey;
        let expiration = Time.now() + clientSessionTimeout;

        let newSession : ClientSession = {
          clientId = accountKey;
          sessionToken = sessionToken;
          expiration = expiration;
        };
        clientSessions.add(sessionToken, newSession);

        let updatedAccount = { account with activeSessionToken = ?sessionToken };
        clientAccounts.add(accountKey, updatedAccount);

        ?sessionToken;
      };
      case (_, _) {
        Runtime.trap("Invalid email/mobile or password");
      };
    };
  };

  public shared ({ caller }) func clientLogout(sessionToken : Text) : async Bool {
    switch (clientSessions.get(sessionToken)) {
      case (null) { false };
      case (?session) {
        clientSessions.remove(sessionToken);
        
        switch (clientAccounts.get(session.clientId)) {
          case (?account) {
            let updatedAccount = { account with activeSessionToken = null };
            clientAccounts.add(session.clientId, updatedAccount);
          };
          case (null) {};
        };
        
        true;
      };
    };
  };

  public shared ({ caller }) func changeClientPassword(
    sessionToken : Text,
    currentPassword : Text,
    newPassword : Text,
  ) : async Bool {
    let clientId = getClientIdFromSession(sessionToken);

    switch (clientAccounts.get(clientId)) {
      case (null) {
        Runtime.trap("Client account not found");
      };
      case (?account) {
        if (not Text.equal(account.password, currentPassword)) {
          Runtime.trap("Invalid current password");
        };

        if (newPassword.size() < 8) {
          Runtime.trap("New password must be at least 8 characters long");
        };

        let updatedAccount = {
          account with
          password = newPassword;
          isFirstLogin = false;
        };
        clientAccounts.add(clientId, updatedAccount);

        true;
      };
    };
  };

  public shared ({ caller }) func verifyOtpAndAuthenticate(phoneNumber : Text, otp : Text) : async ?Text {
    let (isSuccess, _, _) = await verifyOtp(phoneNumber, otp);
    if (not isSuccess) {
      return null;
    };

    let normalizedPhone = normalizeIdentifier(phoneNumber);

    var matchedAccountKey : ?Text = null;
    var matchedAccount : ?ClientAccount = null;

    for ((accountKey, account) in clientAccounts.entries()) {
      switch (account.mobile) {
        case (?mobile) {
          if (Text.equal(normalizeIdentifier(mobile), normalizedPhone)) {
            matchedAccountKey := ?accountKey;
            matchedAccount := ?account;
          };
        };
        case (null) {};
      };
    };

    switch (matchedAccountKey, matchedAccount) {
      case (?accountKey, ?account) {
        let sessionToken = Time.now().toText() # "_otp_session_" # accountKey;
        let expiration = Time.now() + clientSessionTimeout;

        let newSession : ClientSession = {
          clientId = accountKey;
          sessionToken = sessionToken;
          expiration = expiration;
        };
        clientSessions.add(sessionToken, newSession);

        let updatedAccount = { account with activeSessionToken = ?sessionToken };
        clientAccounts.add(accountKey, updatedAccount);

        ?sessionToken;
      };
      case (_, _) { null };
    };
  };

  public shared ({ caller }) func createClientAccount(
    email : ?Text,
    mobile : ?Text,
    temporaryPassword : Text,
    profile : UserProfile,
    adminToken : Text,
  ) : async Text {
    if (not isValidSession(adminToken)) {
      Runtime.trap("Unauthorized: Only admins can create client accounts");
    };

    if (email == null and mobile == null) {
      Runtime.trap("Either email or mobile must be provided");
    };

    let normalizedEmail = switch (email) {
      case (?e) { ?normalizeIdentifier(e) };
      case (null) { null };
    };

    let normalizedMobile = switch (mobile) {
      case (?m) { ?normalizeIdentifier(m) };
      case (null) { null };
    };

    let primaryIdentifier = switch (normalizedEmail, normalizedMobile) {
      case (?e, _) { e };
      case (null, ?m) { m };
      case (null, null) { Runtime.trap("Invalid account data") };
    };

    for ((_, account) in clientAccounts.entries()) {
      if (Text.equal(normalizeIdentifier(account.identifier), primaryIdentifier)) {
        Runtime.trap("Client account already exists with this identifier");
      };
      switch (account.email) {
        case (?existingEmail) {
          switch (normalizedEmail) {
            case (?newEmail) {
              if (Text.equal(normalizeIdentifier(existingEmail), newEmail)) {
                Runtime.trap("Client account already exists with this email");
              };
            };
            case (null) {};
          };
        };
        case (null) {};
      };
      switch (account.mobile) {
        case (?existingMobile) {
          switch (normalizedMobile) {
            case (?newMobile) {
              if (Text.equal(normalizeIdentifier(existingMobile), newMobile)) {
                Runtime.trap("Client account already exists with this mobile");
              };
            };
            case (null) {};
          };
        };
        case (null) {};
      };
    };

    let newAccount : ClientAccount = {
      identifier = primaryIdentifier;
      email = normalizedEmail;
      mobile = normalizedMobile;
      password = temporaryPassword;
      profile = profile;
      isFirstLogin = true;
      activeSessionToken = null;
      role = #client;
      createdAt = Time.now();
    };

    clientAccounts.add(primaryIdentifier, newAccount);
    primaryIdentifier;
  };

  public query ({ caller }) func getClientAccountStatus(sessionToken : Text) : async { isFirstLogin : Bool; role : ClientRole } {
    let clientId = getClientIdFromSession(sessionToken);

    switch (clientAccounts.get(clientId)) {
      case (null) {
        Runtime.trap("Client account not found");
      };
      case (?account) {
        { 
          isFirstLogin = account.isFirstLogin;
          role = account.role;
        };
      };
    };
  };

  public shared ({ caller }) func persistentUpgrade(email : Text) : async Bool {
    for ((_, account) in clientAccounts.entries()) {
      switch (account.email) {
        case (?existingEmail) {
          if (Text.equal(existingEmail, email)) {
            return false;
          };
        };
        case (null) {};
      };
    };
    true;
  };

  public query ({ caller }) func healthCheck() : async Text {
    "System is healthy and ready for persistent operations. Canister version: 1.1.1-persistent";
  };
};
