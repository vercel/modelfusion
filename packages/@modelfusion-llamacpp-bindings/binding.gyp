{
  "targets": [
      {
      "target_name": "llamacpp-bindings-native",
      "type": "none",
      "actions": [
        {
          "action_name": "build",
          "inputs": ["<(module_root_dir)/CMakeLists.txt"],
          "outputs": ["<(module_root_dir)/build"],
          "action": ["cmake-js"]
        }
      ]
    }
  ]
}