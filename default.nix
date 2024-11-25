# nixos-23.11
{
  pkgs ? import (fetchTarball "https://github.com/NixOS/nixpkgs/archive/bacb8503d3a51d9e9b52e52a1ba45e2c380ad07d.tar.gz") {}
}:

pkgs.mkShell {
    name = "instant-markdown-d";
    # nativeBuildInputs is usually what you want -- tools you need to run
    nativeBuildInputs = with pkgs.buildPackages; [
      nodePackages.npm
      git
      geckodriver
    ];
    # libs
    buildInputs = with pkgs; [
      pkgs.nodejs-slim_18
    ];
    shellHook = ''
      npm install .
      ln -rsf ./src/cli.js node_modules/.bin/instant-markdown-d
      export PATH="$PWD/node_modules/.bin:$PATH"
    '';
}

