#include <chrono>
#include <cstdlib>
#include <filesystem>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>
#include <variant>

template <typename Concrete>
class Logger {
 public:
  template <typename... Ts>
  void log(Ts... args) const {
    const auto now{std::chrono::system_clock::now()};
    const auto t_c{std::chrono::system_clock::to_time_t(now)};

    std::stringstream ss;
    ss << std::put_time(std::localtime(&t_c), "[%F %T]");
    ((ss << " " << to_string(args)), ...);

    static_cast<const Concrete*>(this)->output(ss.str());
  }

 private:
  template <typename T>
  std::string to_string(T value) const {
    return std::to_string(value);
  }

  std::string to_string(const char* value) const { return value; }
};

class StdoutLogger : public Logger<StdoutLogger> {
 public:
  void output(const std::string& message) const { std::cout << message << std::endl; }
};

class FileLogger : public Logger<FileLogger> {
 public:
  explicit FileLogger(std::filesystem::path path) : path_{path} {}

  void output(const std::string& message) const {
    std::ofstream fout{path_};
    fout << message << std::endl;
  }

 private:
  std::filesystem::path path_;
};

using LoggerVariant = std::variant<StdoutLogger, FileLogger>;

class Worker {
 public:
  Worker(const LoggerVariant& logger) : logger_{logger} {}

  void do_some_work() {
    std::visit([](auto&& v) { v.log("Providing random integer:", std::rand()); }, logger_);
  }

 private:
  const LoggerVariant& logger_;
};

int main() {
  LoggerVariant stdout_logger{StdoutLogger{}};
  Worker stdout_worker{stdout_logger};

  LoggerVariant file_logger{FileLogger{"output.txt"}};
  Worker file_worker{file_logger};

  stdout_worker.do_some_work();
  file_worker.do_some_work();
}