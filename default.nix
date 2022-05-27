{
  pkgs ? import <nixpkgs> {}
}:

pkgs.mkShell {
    name = "instant-markdown-d";
    # nativeBuildInputs is usually what you want -- tools you need to run
    nativeBuildInputs = with pkgs.buildPackages; [
      nodePackages.npm
    ];
    # libs
    buildInputs = with pkgs; [
      nodejs-slim-12_x
      git
    ];
    shellHook = ''
      npm install -g
    '';
}

