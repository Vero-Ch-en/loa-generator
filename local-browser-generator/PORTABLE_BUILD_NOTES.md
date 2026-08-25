# Portable Build Notes

The Windows launcher is built with `@yao-pkg/pkg` using the `node24-win-x64` target and source-mode flags (`--no-bytecode --public-packages "*" --public`) to support Linux-to-Windows cross-compilation.

The packaging approach and target guidance are based on the package documentation: [@yao-pkg/pkg on npm](https://www.npmjs.com/package/@yao-pkg/pkg) and [Targets documentation](https://yao-pkg.github.io/pkg/guide/targets). The portable launcher is designed to run without a separate Node.js installation; Microsoft Word remains a required local dependency for layout-preserving PDF conversion.
