# Release

To release a new version of RESTer:

1. Define new version

    ```sh
    VERSION=3.11.1
    ```

1. Checkout new branch

    ```sh
    git checkout -b version-$VERSION
    ```

1. Update version in `package.json`

1. Update version in `src/manifest.json`

1. Add new version in `CHANGELOG.md`

1. Build the extension and update library-links.md

    ```sh
    yarn build
    mv docs/library-links.md.new docs/library-links.md
    ```

1. Commit and push changes

    ```sh
    git commit -am "Update version to $VERSION"
    git push origin -u version-$VERSION
    ```

1. Create and push tag

    ```sh
    git tag $VERSION
    git push origin --tags
    ```

1. Create pull request and wait for build to pass

1. Create packages

    ```sh
    yarn build
    yarn package
    git archive -o package/RESTer-$VERSION.zip $VERSION
    ```

1. Upload to AMO

    https://addons.mozilla.org/en-US/developers/addon/rester/versions/submit/

1. Update AMO _Whiteboard_ with new library versions

    https://addons.mozilla.org/en-US/developers/addon/rester/edit#edit-addon-technical

1. Upload to Chrome Web Store

    https://chrome.google.com/webstore/developer/dashboard

1. Merge pull request
