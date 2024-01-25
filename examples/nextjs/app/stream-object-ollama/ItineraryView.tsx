import { Itinerary } from "./itinerarySchema";

export const ItineraryView = ({ itinerary }: { itinerary?: Itinerary }) => (
  <div className="mt-8">
    {itinerary?.days && (
      <>
        <h2 className="text-xl font-bold mb-4">Your Itinerary</h2>
        <div className="space-y-4">
          {itinerary.days.map(
            (day, index) =>
              day && (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-bold">{day.theme ?? ""}</h3>

                  {day.activities?.map(
                    (activity, index) =>
                      activity && (
                        <div key={index} className="mt-4">
                          {activity.name && (
                            <h4 className="font-bold">{activity.name}</h4>
                          )}
                          {activity.description && (
                            <p className="text-gray-500">
                              {activity.description}
                            </p>
                          )}
                          {activity.duration && (
                            <p className="text-sm text-gray-400">{`Duration: ${activity.duration} hours`}</p>
                          )}
                        </div>
                      )
                  )}
                </div>
              )
          )}
        </div>
      </>
    )}
  </div>
);
