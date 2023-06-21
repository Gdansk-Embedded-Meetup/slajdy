#include <cstdio>

int main() {
  int captured_variable = 10;

  auto lambda = [&captured_variable](int param_value) { return captured_variable * param_value; };

  class Functor {
   public:
    explicit Functor(int& captured_variable) : captured_variable_{captured_variable} {}

    int operator()(int param_value) { return captured_variable_ * param_value; }

   private:
    int& captured_variable_;
  };
  Functor functor{captured_variable};

  printf("Lambda result  = %d\n", lambda(20));
  printf("Functor result = %d\n", functor(20));
}