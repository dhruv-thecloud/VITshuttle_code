#ifndef VIT_BUS_BACKEND_H
#define VIT_BUS_BACKEND_H

#ifdef __cplusplus
extern "C" {
#endif

#define APP_MAX_BUSES 8
#define APP_MAX_ROUTE_STOPS 8
#define APP_MAX_NOTIFICATIONS 16
#define APP_MAX_TEXT 128
#define APP_MAX_MESSAGE 256

typedef enum BusStatus {
  BUS_ON_TIME = 0,
  BUS_BOARDING = 1,
  BUS_DELAYED = 2,
  BUS_ROUTE_CHANGE = 3,
  BUS_MAINTENANCE = 4
} BusStatus;

typedef struct Bus {
  char id[16];
  char code[32];
  char route_name[64];
  char driver[64];
  BusStatus status;
  int eta_minutes;
  char next_stop[APP_MAX_TEXT];
  char capacity[32];
  char note[APP_MAX_MESSAGE];
  char route_path[APP_MAX_ROUTE_STOPS][APP_MAX_TEXT];
  int route_stop_count;
  long updated_epoch;
} Bus;

typedef struct Notification {
  char bus_id[16];
  char title[64];
  char message[APP_MAX_MESSAGE];
  long created_epoch;
} Notification;

typedef struct AppState {
  Bus buses[APP_MAX_BUSES];
  int bus_count;
  Notification notifications[APP_MAX_NOTIFICATIONS];
  int notification_count;
  long clock_epoch;
} AppState;

void app_reset(AppState* state);
const char* app_status_label(BusStatus status);
int app_find_bus_index_by_id(const AppState* state, const char* bus_id);
int app_update_bus(
    AppState* state,
    const char* bus_id,
    BusStatus status,
    int eta_minutes,
    const char* next_stop,
    const char* capacity,
    const char* note,
    const char route_path[][APP_MAX_TEXT],
    int route_stop_count);
void app_advance_minutes(AppState* state, int minutes);
void app_add_notification(AppState* state, const char* bus_id, const char* title, const char* message);

#ifdef __cplusplus
}
#endif

#endif
