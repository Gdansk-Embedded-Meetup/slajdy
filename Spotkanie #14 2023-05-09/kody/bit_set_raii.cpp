#include <cstdint>
#include <cstdio>

template <typename T>
class BitSetter {
 public:
  BitSetter(T* ptr, T mask) : ptr_{ptr}, mask_{mask} { *ptr_ |= mask_; }

  ~BitSetter() { *ptr_ &= ~mask_; }

 private:
  T* ptr_;
  T mask_;
};

void test_fn(auto* value, auto mask) {
  BitSetter setter{value, mask};
  printf("%d\n", *value);
}

int main() {
  uint32_t value{1};
  uint32_t mask{1 << 1};
  test_fn(&value, mask);
  printf("%d\n", value);

  return 0;
}

// Output for x86-64 gcc 13.1 with "-std=c++23 -O2 -fno-exceptions" args:
// .LC0:
//   .string "%d\n"
// main:
//   sub rsp, 8
//   mov esi, 3
//   mov edi, OFFSET FLAT:.LC0
//   xor eax, eax
//   call printf
//   mov esi, 1
//   mov edi, OFFSET FLAT:.LC0
//   xor eax, eax
//   call printf
//   xor eax, eax
//   add rsp, 8
//   ret