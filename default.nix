{
  pkgs ? import <nixpkgs> {}
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
      nodejs-slim-12_x
    ];
    shellHook = ''
      npm install .
      ln -rsf ./src/cli.js node_modules/.bin/instant-markdown-d
      export PATH="$PWD/node_modules/.bin:$PATH"
    '';
}

