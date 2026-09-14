CC := gcc
CXX := g++
CFLAGS := -std=c11 -Wall -Wextra -pedantic
CXXFLAGS := -std=c++17 -Wall -Wextra -pedantic
BUILD_DIR := build
TARGET := $(BUILD_DIR)/vit_bus_app

.PHONY: all clean run

all: $(TARGET)

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(BUILD_DIR)/backend.o: src/backend.c src/backend.h | $(BUILD_DIR)
	$(CC) $(CFLAGS) -c src/backend.c -o $@

$(BUILD_DIR)/main.o: src/main.cpp src/backend.h | $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) -c src/main.cpp -o $@

$(TARGET): $(BUILD_DIR)/backend.o $(BUILD_DIR)/main.o
	$(CXX) $(CXXFLAGS) $^ -o $@

run: $(TARGET)
	./$(TARGET)

clean:
	rm -rf $(BUILD_DIR)
