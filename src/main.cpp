#include "backend.h"

#include <algorithm>
#include <cctype>
#include <cstdio>
#include <ctime>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

namespace {

std::string trim(const std::string& value) {
  const std::string whitespace = " \t\n\r";
  const std::size_t start = value.find_first_not_of(whitespace);
  const std::size_t end = value.find_last_not_of(whitespace);

  if (start == std::string::npos) {
    return "";
  }

  return value.substr(start, end - start + 1);
}

std::string toLower(std::string value) {
  std::transform(value.begin(), value.end(), value.begin(), [](unsigned char ch) {
    return static_cast<char>(std::tolower(ch));
  });
  return value;
}

std::string formatTime(long epoch) {
  const std::time_t raw_time = static_cast<std::time_t>(epoch);
  std::tm* local_time = std::localtime(&raw_time);
  std::ostringstream output;
  output << std::put_time(local_time, "%d %b %Y %H:%M");
  return output.str();
}

int readInt(const std::string& prompt, int minimum, int maximum) {
  while (true) {
    std::string line;
    std::cout << prompt;
    std::getline(std::cin, line);
    std::stringstream parser(line);
    int value = 0;

    if (parser >> value && value >= minimum && value <= maximum) {
      return value;
    }

    std::cout << "Enter a number between " << minimum << " and " << maximum << ".\n";
  }
}

std::string readLine(const std::string& prompt) {
  std::string line;
  std::cout << prompt;
  std::getline(std::cin, line);
  return trim(line);
}

BusStatus readStatus() {
  std::cout << "\nChoose status:\n";
  std::cout << "1. On Time\n";
  std::cout << "2. Boarding\n";
  std::cout << "3. Delayed\n";
  std::cout << "4. Route Change\n";
  std::cout << "5. Maintenance\n";

  switch (readInt("Selection: ", 1, 5)) {
    case 1:
      return BUS_ON_TIME;
    case 2:
      return BUS_BOARDING;
    case 3:
      return BUS_DELAYED;
    case 4:
      return BUS_ROUTE_CHANGE;
    default:
      return BUS_MAINTENANCE;
  }
}

std::vector<std::string> splitStops(const std::string& text) {
  std::vector<std::string> stops;
  std::stringstream stream(text);
  std::string item;

  while (std::getline(stream, item, ',')) {
    const std::string stop = trim(item);
    if (!stop.empty()) {
      stops.push_back(stop);
    }
  }

  return stops;
}

void printDivider() {
  std::cout << "\n============================================================\n";
}

void showHeader(const AppState& state) {
  printDivider();
  std::cout << "VIT Bus Route Tracking and Management System\n";
  std::cout << "Campus clock: " << formatTime(state.clock_epoch) << "\n";
  std::cout << "Active buses: " << state.bus_count << " | Notifications: " << state.notification_count << "\n";
  printDivider();
}

void showBusSummary(const Bus& bus, int index) {
  std::cout << index + 1 << ". " << bus.id << " | " << bus.route_name << " | "
            << app_status_label(bus.status) << " | ETA " << bus.eta_minutes
            << " min | Next stop: " << bus.next_stop << "\n";
}

void showAllBuses(const AppState& state) {
  std::cout << "\nLive route board\n";
  for (int index = 0; index < state.bus_count; ++index) {
    showBusSummary(state.buses[index], index);
  }
}

void showBusDetails(const Bus& bus) {
  std::cout << "\n" << bus.id << " - " << bus.route_name << "\n";
  std::cout << "Code: " << bus.code << "\n";
  std::cout << "Driver: " << bus.driver << "\n";
  std::cout << "Status: " << app_status_label(bus.status) << "\n";
  std::cout << "ETA: " << bus.eta_minutes << " min\n";
  std::cout << "Next stop: " << bus.next_stop << "\n";
  std::cout << "Capacity: " << bus.capacity << "\n";
  std::cout << "Last update: " << formatTime(bus.updated_epoch) << "\n";
  std::cout << "Note: " << bus.note << "\n";
  std::cout << "Route path:\n";

  for (int stop_index = 0; stop_index < bus.route_stop_count; ++stop_index) {
    const bool current_stop = std::string(bus.route_path[stop_index]) == bus.next_stop;
    std::cout << "  - " << bus.route_path[stop_index];
    if (current_stop) {
      std::cout << " [next]";
    }
    std::cout << "\n";
  }
}

void searchRoutes(const AppState& state) {
  const std::string query = toLower(readLine("\nSearch route or stop: "));
  bool found = false;

  if (query.empty()) {
    std::cout << "Search term is empty.\n";
    return;
  }

  for (int index = 0; index < state.bus_count; ++index) {
    const Bus& bus = state.buses[index];
    std::string haystack = toLower(std::string(bus.id) + " " + bus.code + " " + bus.route_name + " " + bus.next_stop);

    for (int stop_index = 0; stop_index < bus.route_stop_count; ++stop_index) {
      haystack += " ";
      haystack += toLower(bus.route_path[stop_index]);
    }

    if (haystack.find(query) != std::string::npos) {
      showBusSummary(bus, index);
      found = true;
    }
  }

  if (!found) {
    std::cout << "No routes matched the search term.\n";
  }
}

void showNotifications(const AppState& state) {
  std::cout << "\nNotifications\n";
  if (state.notification_count == 0) {
    std::cout << "No notifications available.\n";
    return;
  }

  for (int index = 0; index < state.notification_count; ++index) {
    const Notification& item = state.notifications[index];
    std::cout << index + 1 << ". [" << item.bus_id << "] " << item.title << "\n";
    std::cout << "   " << item.message << "\n";
    std::cout << "   " << formatTime(item.created_epoch) << "\n";
  }
}

void userInterface(const AppState& state) {
  while (true) {
    std::cout << "\nUser interface\n";
    std::cout << "1. View all routes\n";
    std::cout << "2. Search route or stop\n";
    std::cout << "3. View a bus in detail\n";
    std::cout << "4. View notifications\n";
    std::cout << "0. Back\n";

    const int choice = readInt("Selection: ", 0, 4);
    if (choice == 0) {
      return;
    }

    if (choice == 1) {
      showAllBuses(state);
    } else if (choice == 2) {
      searchRoutes(state);
    } else if (choice == 3) {
      showAllBuses(state);
      const int selection = readInt("Pick bus number: ", 1, state.bus_count);
      showBusDetails(state.buses[selection - 1]);
    } else if (choice == 4) {
      showNotifications(state);
    }
  }
}

void driverInterface(AppState& state) {
  std::cout << "\nDriver interface\n";
  showAllBuses(state);

  const int selection = readInt("Select bus number to update: ", 1, state.bus_count);
  Bus bus = state.buses[selection - 1];

  std::cout << "Updating " << bus.id << " - " << bus.route_name << "\n";
  const BusStatus status = readStatus();
  const int eta = readInt("ETA in minutes (0-90): ", 0, 90);

  std::string next_stop = readLine("Next stop [" + std::string(bus.next_stop) + "]: ");
  if (next_stop.empty()) {
    next_stop = bus.next_stop;
  }

  std::string capacity = readLine("Capacity [" + std::string(bus.capacity) + "]: ");
  if (capacity.empty()) {
    capacity = bus.capacity;
  }

  std::string route_input = readLine("Route stops comma-separated (leave blank to keep current): ");
  std::vector<std::string> stops = splitStops(route_input);
  char route_buffer[APP_MAX_ROUTE_STOPS][APP_MAX_TEXT] = {{0}};

  for (std::size_t index = 0; index < stops.size() && index < APP_MAX_ROUTE_STOPS; ++index) {
    std::snprintf(route_buffer[index], APP_MAX_TEXT, "%s", stops[index].c_str());
  }

  std::string note = readLine("Driver note: ");
  if (note.empty()) {
    note = bus.note;
  }

  if (app_update_bus(&state,
                     bus.id,
                     status,
                     eta,
                     next_stop.c_str(),
                     capacity.c_str(),
                     note.c_str(),
                     route_buffer,
                     static_cast<int>(stops.size()))) {
    std::cout << "Update published.\n";
  } else {
    std::cout << "Bus update failed.\n";
  }
}

}  // namespace

int main() {
  AppState state;
  app_reset(&state);

  while (true) {
    showHeader(state);
    std::cout << "1. User interface\n";
    std::cout << "2. Driver interface\n";
    std::cout << "3. Notifications\n";
    std::cout << "4. Advance simulation by 1 minute\n";
    std::cout << "5. Reset demo data\n";
    std::cout << "0. Exit\n";

    const int choice = readInt("Selection: ", 0, 5);

    if (choice == 0) {
      break;
    }

    if (choice == 1) {
      userInterface(state);
    } else if (choice == 2) {
      driverInterface(state);
    } else if (choice == 3) {
      showNotifications(state);
    } else if (choice == 4) {
      app_advance_minutes(&state, 1);
      std::cout << "Simulation advanced by 1 minute.\n";
    } else if (choice == 5) {
      app_reset(&state);
      std::cout << "Demo data restored.\n";
    }
  }

  std::cout << "Exiting VIT transport app.\n";
  return 0;
}
