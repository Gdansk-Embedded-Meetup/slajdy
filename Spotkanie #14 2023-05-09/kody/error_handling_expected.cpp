#include <algorithm>
#include <expected>
#include <filesystem>
#include <fstream>
#include <iostream>
#include <ranges>
#include <string>
#include <vector>

struct PersonData {
  std::string name;
  int age;
  float height;
};

class Error {
 public:
  Error(std::string message) : message_{message} {}

  std::string message() const { return message_; }

 private:
  std::string message_;
};

template <class T>
using Result = std::expected<T, Error>;

[[nodiscard]] Result<std::vector<PersonData>> parse_csv(std::filesystem::path path) {
  if (!std::filesystem::exists(path)) {
    return std::unexpected(Error{"File not found."});
  }

  std::vector<PersonData> output;
  std::ifstream input_stream{path};
  std::string line;

  while (std::getline(input_stream, line)) {
    std::vector<std::string> data_vec;
    std::ranges::copy(std::views::split(line, ';') | std::views::transform([](auto&& x) { return std::string{x}; }),
                      std::back_inserter(data_vec));

    if (data_vec.size() > 3) {
      return std::unexpected(Error{"Invalid number of delimiters."});
    }

    // This error handling is limited, but enough for this example.

    PersonData data{.name = data_vec[0], .age = std::stoi(data_vec[1]), .height = std::stof(data_vec[2])};
    output.push_back(data);
  }

  return output;
}

#define RETURN_ON_ERROR(x) \
  if (!x) [[unlikely]]     \
  return std::unexpected(x.error())

Result<size_t> parse_and_count_entries(std::filesystem::path path) {
  auto result{parse_csv(path)};
  RETURN_ON_ERROR(result);

  return result.value().size();
}

int main() {
  auto count{parse_and_count_entries("example_ok.csv")};
  if (count) {
    std::cout << "Result: " << count.value() << std::endl;
  } else {
    std::cout << "Error: " << count.error().message() << std::endl;
  }
}