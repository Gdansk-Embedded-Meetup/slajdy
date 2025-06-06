#include <chrono>
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>

class Logger {
 public:
  template <typename... Ts>
  void log(Ts... args) const {
    const auto now{std::chrono::system_clock::now()};
    const auto t_c{std::chrono::system_clock::to_time_t(now)};

    std::stringstream ss;
    ss << std::put_time(std::localtime(&t_c), "[%F %T]");
    ((ss << " " << to_string(args)), ...);

    output(ss.str());
  }

  virtual void output(const std::string& message) const = 0;

 private:
  template <typename T>
  std::string to_string(T value) const {
    return std::to_string(value);
  }

  std::string to_string(const char* value) const { return value; }
};

class StdoutLogger : public Logger {
 public:
  void output(const std::string& message) const override { std::cout << message << std::endl; }
};

class FileLogger : public Logger {
 public:
  explicit FileLogger(std::filesystem::path path) : path_{path} {}

  void output(const std::string& message) const override {
    std::ofstream fout{path_};
    fout << message << std::endl;
  }

 private:
  std::filesystem::path path_;
};

class Worker {
 public:
  Worker(const Logger* const logger) : logger_{logger} {}

  void do_some_work() { logger_->log("Providing random integer:", std::rand()); }

 private:
  const Logger* const logger_;
};

int main() {
  StdoutLogger stdout_logger;
  Worker stdout_worker{&stdout_logger};

  FileLogger file_logger{"output.txt"};
  Worker file_worker{&file_logger};

  stdout_worker.do_some_work();
  file_worker.do_some_work();
}