#include <algorithm>
#include <deque>
#include <iostream>
#include <unordered_set>

// Basic bidirected graph implementation.
class Node {
 public:
  void add_connection(Node* other) {
    connections_.emplace(other);
    other->connections_.emplace(this);
  }

  bool connected_to(Node* other) const { return connections_.contains(other); }

  const std::unordered_set<Node*>& connections() const { return connections_; }

 private:
  std::unordered_set<Node*> connections_;
};

int main() {
  // Create empty nodes.
  std::deque<Node> nodes{5};

  // Connect nodes to each other.
  // #0 to #0, #1, #2
  nodes[0].add_connection(&nodes[0]);
  nodes[0].add_connection(&nodes[1]);
  nodes[0].add_connection(&nodes[2]);
  // #2 to #3.
  nodes[2].add_connection(&nodes[3]);

  // Check if any of nodes connect to #3.
  auto any_of_result =
      std::any_of(nodes.begin(), nodes.end(), [&nodes](const Node& node) { return node.connected_to(&nodes[3]); });
  std::cout << "#3 connected = " << any_of_result << std::endl; // "#3 connected = 1"

  // Check if all nodes have connection.
  auto all_of_result =
      std::all_of(nodes.begin(), nodes.end(), [](const Node& node) { return !node.connections().empty(); });
  std::cout << "All connected = " << all_of_result << std::endl; // "All connected = 0"
}