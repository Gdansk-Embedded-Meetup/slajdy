#include <algorithm>
#include <iostream>

template <typename T>
class unique_ptr {
 public:
  explicit unique_ptr(T* ptr) : ptr_{ptr} {}

  ~unique_ptr() { delete ptr_; }

  unique_ptr(const unique_ptr& other) = delete;
  unique_ptr& operator=(const unique_ptr& other) = delete;

  unique_ptr(unique_ptr&& other) : ptr_{other.release()} {}
  unique_ptr& operator=(unique_ptr&& other) {
    ptr_ = other.release();
    return *this;
  }

  T* release() {
    auto result{ptr_};
    ptr_ = nullptr;
    return result;
  }

  void reset(T* ptr) {
    delete ptr_;
    ptr_ = ptr;
  }

  void swap(unique_ptr& other) { std::swap(ptr_, other.ptr_); }

  T* get() const { return ptr_; }

  T& operator*() const { return *get(); }

  T* operator->() const { return get(); }

  explicit operator bool() const { return ptr_ != nullptr; }

 private:
  T* ptr_;
};

int main() {
  unique_ptr<int> first{new int(1)};
  std::cout << *first << std::endl;
  auto second{std::move(first)};
  std::cout << *second << std::endl;
}