#include <cstdint>
#include <cstdio>

#define WITH_BIT_SET(ptr, mask, action) \
  *ptr |= mask;                         \
  action;                               \
  *ptr &= ~mask

void test_fn(auto* value, auto mask) {
  WITH_BIT_SET(value, mask, { printf("%d\n", *value); });
}

int main() {
  uint32_t value = 1;
  uint32_t mask = 1 << 1;
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