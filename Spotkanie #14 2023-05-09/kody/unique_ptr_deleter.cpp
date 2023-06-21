#include <cstdio>
#include <memory>

using FilePtr = std::unique_ptr<FILE, decltype([](FILE* f) { std::fclose(f); })>;

void print_content(const char* file_path) {
  FilePtr file{std::fopen(file_path, "r")};

  int c;
  while ((c = std::fgetc(file.get())) != EOF) {
    std::putchar(c);
  }
}

int main() {
  print_content("example.txt");
  return 0;
}