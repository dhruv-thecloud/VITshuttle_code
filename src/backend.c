#include "backend.h"

#include <stdio.h>
#include <string.h>
#include <time.h>

static long current_epoch(void) {
  return (long)time(NULL);
}

static void copy_text(char* destination, size_t size, const char* source) {
  if (size == 0) {
    return;
  }

  if (source == NULL) {
    destination[0] = '\0';
    return;
  }

  snprintf(destination, size, "%s", source);
}

static void fill_bus(
    Bus* bus,
    const char* id,
    const char* code,
    const char* route_name,
    const char* driver,
    BusStatus status,
    int eta_minutes,
    const char* next_stop,
    const char* capacity,
    const char* note,
    const char route_path[][APP_MAX_TEXT],
    int route_stop_count,
    long updated_epoch) {
  int index;

  copy_text(bus->id, sizeof(bus->id), id);
  copy_text(bus->code, sizeof(bus->code), code);
  copy_text(bus->route_name, sizeof(bus->route_name), route_name);
  copy_text(bus->driver, sizeof(bus->driver), driver);
  bus->status = status;
  bus->eta_minutes = eta_minutes;
  copy_text(bus->next_stop, sizeof(bus->next_stop), next_stop);
  copy_text(bus->capacity, sizeof(bus->capacity), capacity);
  copy_text(bus->note, sizeof(bus->note), note);
  bus->route_stop_count = route_stop_count;
  bus->updated_epoch = updated_epoch;

  for (index = 0; index < APP_MAX_ROUTE_STOPS; ++index) {
    bus->route_path[index][0] = '\0';
  }

  for (index = 0; index < route_stop_count && index < APP_MAX_ROUTE_STOPS; ++index) {
    copy_text(bus->route_path[index], sizeof(bus->route_path[index]), route_path[index]);
  }
}

static void seed_buses(AppState* state) {
  static const char mgr_loop[][APP_MAX_TEXT] = {
      "Mahatma Gandhi Road", "Main Gate", "N Block", "Main Gate"};
  static const char hostel_connector[][APP_MAX_TEXT] = {
      "Main Gate", "N Block", "Library Circle", "Main Gate"};
  static const char academic_spine[][APP_MAX_TEXT] = {
      "Main Gate", "SJT Block", "TT", "N Block", "Main Gate"};
  static const char katpadi_connector[][APP_MAX_TEXT] = {
      "Katpadi Junction", "South Avenue", "Main Gate", "N Block"};

  state->bus_count = 4;

  fill_bus(&state->buses[0],
           "VIT-01",
           "MGR Loop",
           "Mahatma Gandhi Road",
           "Rahul Nair",
           BUS_ON_TIME,
           6,
           "Main Gate",
           "34 / 40",
           "Running smoothly toward the campus entrance.",
           mgr_loop,
           4,
           state->clock_epoch - 8 * 60);

  fill_bus(&state->buses[1],
           "VIT-02",
           "Hostel Connector",
           "N Block Shuttle",
           "Priya Menon",
           BUS_BOARDING,
           3,
           "N Block",
           "22 / 40",
           "Boarding students at Main Gate before departure.",
           hostel_connector,
           4,
           state->clock_epoch - 4 * 60);

  fill_bus(&state->buses[2],
           "VIT-03",
           "East Link",
           "Academic Spine",
           "Arjun Kumar",
           BUS_DELAYED,
           11,
           "SJT Block",
           "38 / 40",
           "Traffic near the academic complex adds a short delay.",
           academic_spine,
           5,
           state->clock_epoch - 6 * 60);

  fill_bus(&state->buses[3],
           "VIT-04",
           "City Express",
           "Katpadi Connector",
           "Sneha Iyer",
           BUS_ROUTE_CHANGE,
           14,
           "Main Gate",
           "30 / 40",
           "Temporary diversion via South Avenue while roadwork clears.",
           katpadi_connector,
           4,
           state->clock_epoch - 2 * 60);
}

void app_add_notification(AppState* state, const char* bus_id, const char* title, const char* message) {
  int index;
  Notification item;

  for (index = APP_MAX_NOTIFICATIONS - 1; index > 0; --index) {
    state->notifications[index] = state->notifications[index - 1];
  }

  copy_text(item.bus_id, sizeof(item.bus_id), bus_id);
  copy_text(item.title, sizeof(item.title), title);
  copy_text(item.message, sizeof(item.message), message);
  item.created_epoch = state->clock_epoch;
  state->notifications[0] = item;

  if (state->notification_count < APP_MAX_NOTIFICATIONS) {
    state->notification_count += 1;
  }
}

void app_reset(AppState* state) {
  memset(state, 0, sizeof(*state));
  state->clock_epoch = current_epoch();
  seed_buses(state);

  app_add_notification(
      state,
      "VIT-04",
      "Route Change",
      "Katpadi Connector is using South Avenue before rejoining the campus route.");
  app_add_notification(
      state,
      "VIT-03",
      "Delay Notice",
      "Academic Spine has an 11 minute ETA because of traffic near SJT Block.");
  app_add_notification(
      state,
      "VIT-02",
      "Boarding Update",
      "N Block Shuttle is boarding now and departs in approximately 3 minutes.");
}

const char* app_status_label(BusStatus status) {
  switch (status) {
    case BUS_ON_TIME:
      return "On Time";
    case BUS_BOARDING:
      return "Boarding";
    case BUS_DELAYED:
      return "Delayed";
    case BUS_ROUTE_CHANGE:
      return "Route Change";
    case BUS_MAINTENANCE:
      return "Maintenance";
    default:
      return "Unknown";
  }
}

int app_find_bus_index_by_id(const AppState* state, const char* bus_id) {
  int index;

  for (index = 0; index < state->bus_count; ++index) {
    if (strcmp(state->buses[index].id, bus_id) == 0) {
      return index;
    }
  }

  return -1;
}

int app_update_bus(
    AppState* state,
    const char* bus_id,
    BusStatus status,
    int eta_minutes,
    const char* next_stop,
    const char* capacity,
    const char* note,
    const char route_path[][APP_MAX_TEXT],
    int route_stop_count) {
  int index = app_find_bus_index_by_id(state, bus_id);
  Bus* bus;
  char message[APP_MAX_MESSAGE];

  if (index < 0) {
    return 0;
  }

  bus = &state->buses[index];
  bus->status = status;
  bus->eta_minutes = eta_minutes < 0 ? 0 : eta_minutes;
  copy_text(bus->next_stop, sizeof(bus->next_stop), next_stop);
  copy_text(bus->capacity, sizeof(bus->capacity), capacity);
  copy_text(bus->note, sizeof(bus->note), note);
  bus->updated_epoch = state->clock_epoch;

  if (route_stop_count > 0) {
    int stop_index;

    if (route_stop_count > APP_MAX_ROUTE_STOPS) {
      route_stop_count = APP_MAX_ROUTE_STOPS;
    }

    bus->route_stop_count = route_stop_count;
    for (stop_index = 0; stop_index < APP_MAX_ROUTE_STOPS; ++stop_index) {
      bus->route_path[stop_index][0] = '\0';
    }
    for (stop_index = 0; stop_index < route_stop_count; ++stop_index) {
      copy_text(bus->route_path[stop_index], sizeof(bus->route_path[stop_index]), route_path[stop_index]);
    }
  }

  if (status == BUS_ROUTE_CHANGE) {
    snprintf(message,
             sizeof(message),
             "%s reported a route change. Next stop: %s.",
             bus->route_name,
             bus->next_stop);
    app_add_notification(state, bus->id, "Route Change", message);
  } else if (status == BUS_DELAYED) {
    snprintf(message,
             sizeof(message),
             "%s is delayed. Updated ETA is %d minutes.",
             bus->route_name,
             bus->eta_minutes);
    app_add_notification(state, bus->id, "Delay Notice", message);
  } else if (status == BUS_MAINTENANCE) {
    snprintf(message,
             sizeof(message),
             "%s is out of service for maintenance.",
             bus->route_name);
    app_add_notification(state, bus->id, "Maintenance Alert", message);
  } else {
    snprintf(message,
             sizeof(message),
             "%s updated to %s. Next stop: %s.",
             bus->route_name,
             app_status_label(status),
             bus->next_stop);
    app_add_notification(state, bus->id, "Live Update", message);
  }

  return 1;
}

void app_advance_minutes(AppState* state, int minutes) {
  int minute_index;

  if (minutes <= 0) {
    return;
  }

  for (minute_index = 0; minute_index < minutes; ++minute_index) {
    int index;
    state->clock_epoch += 60;

    for (index = 0; index < state->bus_count; ++index) {
      Bus* bus = &state->buses[index];

      if (bus->status == BUS_MAINTENANCE) {
        continue;
      }

      if (bus->eta_minutes > 0) {
        bus->eta_minutes -= 1;
      }

      if (bus->eta_minutes == 0 && bus->status != BUS_BOARDING) {
        bus->status = BUS_BOARDING;
        bus->updated_epoch = state->clock_epoch;
      }
    }
  }
}
