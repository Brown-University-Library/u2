name: deploy to BUL servers
on: 
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          submodules: true  # Fetch Hugo themes (true OR recursive)
          fetch-depth: 0    # Fetch all history for .GitInfo and .Lastmod

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2.6.0
        with:
          hugo-version: 'latest'
          extended: true

      - name: Build Hugo 
        run: hugo -e production --cleanDestinationDir --minify

# Push changes in a separate checkout step
        run: |
          git config --global user.name "Your Name"
          git config --global user.email "your_email@example.com"
          git add -A
          git commit -m "Auto-generated Hugo site"
          
      - uses: actions/checkout@v4
  with:
    ref: my-branch

# A human must log into Brown server, run code update script to pull the public branch/repo
