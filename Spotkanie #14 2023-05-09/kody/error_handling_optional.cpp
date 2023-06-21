#include <filesystem>
#include <iostream>
#include <optional>

namespace fs = std::filesystem;

std::optional<fs::path> absolute_path(const fs::path& p) {
  if (not fs::exists(p)) {
    return {};
  }

  return fs::absolute(p);
}

int main() {
  auto result{absolute_path("example_ok.csv")};
  if (result) {
    std::cout << result.value() << std::endl;
  } else {
    std::cout << "Path not found." << std::endl;
  }
}