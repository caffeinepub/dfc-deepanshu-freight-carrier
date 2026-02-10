import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
  type Coordinates = {
    latitude : Float;
    longitude : Float;
  };

  type OldShipment = {
    trackingID : Text;
    status : Text;
    location : Text;
    client : Principal;
  };

  type NewShipment = {
    trackingID : Text;
    status : Text;
    location : Text;
    client : Principal;
    coordinates : ?Coordinates;
  };

  type OldActor = {
    shipments : Map.Map<Text, OldShipment>;
  };

  type NewActor = {
    shipments : Map.Map<Text, NewShipment>;
  };

  public func run(old : OldActor) : NewActor {
    let newShipments = old.shipments.map<Text, OldShipment, NewShipment>(
      func(_, oldShipment) {
        { oldShipment with coordinates = null };
      }
    );
    {
      old with
      shipments = newShipments;
    };
  };
};
