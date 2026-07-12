package com.Transitops.odoo.service;

import com.Transitops.odoo.dto.request.TripCancelRequest;
import com.Transitops.odoo.dto.request.TripCompleteRequest;
import com.Transitops.odoo.dto.request.TripDispatchRequest;
import com.Transitops.odoo.dto.request.TripRequest;
import com.Transitops.odoo.dto.request.TripTrackingRequest;
import com.Transitops.odoo.dto.response.TripAnalyticsResponse;
import com.Transitops.odoo.dto.response.TripEtaResponse;
import com.Transitops.odoo.dto.response.TripLocationResponse;
import com.Transitops.odoo.dto.response.TripResponse;
import com.Transitops.odoo.dto.response.TripTrackingResponse;

import java.util.List;

public interface TripService {

    TripResponse createTrip(TripRequest request);

    TripResponse updateTrip(String tripId, TripRequest request);

    TripResponse getTripById(String tripId);

    List<TripResponse> getAllTrips();

    List<TripResponse> getActiveTrips();

    List<TripResponse> getCompletedTrips();

    List<TripResponse> getCancelledTrips();

    TripResponse dispatchTrip(String tripId, TripDispatchRequest request);

    TripResponse completeTrip(String tripId, TripCompleteRequest request);

    TripResponse cancelTrip(String tripId, TripCancelRequest request);

    TripTrackingResponse addTracking(String tripId, TripTrackingRequest request);

    List<TripTrackingResponse> getTracking(String tripId);

    TripLocationResponse getCurrentLocation(String tripId);

    TripEtaResponse getEta(String tripId);

    TripAnalyticsResponse getAnalytics();
}
