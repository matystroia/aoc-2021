{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  outputs =
    { self, nixpkgs }:
    let
      system = "x86_64-linux";
      pkgs = nixpkgs.legacyPackages.${system};
    in
    {
      packages.${system}.default = pkgs.buildNpmPackage {
        pname = "aoc21";
        version = "0.1.0";
        src = self;
        nodejs = pkgs.nodejs_22;
        npmDepsHash = "sha256-qCtv5/HkF5PthGk/tguAMIFfcDeQUokxwX60zDcJDns=";

        npmFlags = [ "--ignore-scripts" ];

        env = {
          NEXT_TELEMETRY_DISABLED = "1";
          NEXT_PUBLIC_BASE_PATH = "";
        };

        installPhase = ''
          runHook preInstall
          mkdir -p $out
          cp -r .next/standalone/. $out/
          mkdir -p $out/.next
          cp -r .next/static $out/.next/static
          cp -r public $out/public
          runHook postInstall
        '';
      };

      devShells.${system}.default = pkgs.mkShell {
        packages = [ pkgs.nodejs_22 ];
      };
    };
}
