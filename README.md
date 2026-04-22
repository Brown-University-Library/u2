The U2 Egypt project aims to digitize a series of recently declassified aerial photographs that document the Nile Delta and Nile Valley. Shot by U2 spy planes, this imagery provides much higher resolution images than any currently available imagery (for instance the CORONA satellite imagery that has revolutionized archaeology in this area in the past two decades), and shows the landscape prior to the construction of the Aswan High Dam.

This repo contains the website which contextualizes the images, provides geographical information about them, and describes the project.

# Specs

This site is built in Hugo. The command to build the site for the development server, including drafts, is ```hugo -e development -D --minify --cleanDestinationDir -b /projects/u2egypt```. The command to build the site for production is ```hugo -e production --minify --cleanDestinationDir```. To deploy, you must be on VPN, and rsync files: ```rsync -avz public username@.server:/var/www/html/projects/u2egypt``` replacing `username` and `server` with the correct values.

## Dependencies

The image comparison functionality is by [@cloudfour](https://github.com/cloudfour/image-compare). The map is built with [Leaflet](https://leafletjs.com) and a number of plugins.

## Custom shortcodes

To embed a BDR item using Mirador, use the following shortcode:
```
{{< mirador "1234" >}}
```
where 1234 is the _numeric_ value for a BDR PID, e.g., the item at https://repository.library.brown.edu/studio/item/bdr:89322/ would be rendered with `{{< mirador "89322" >}}`. Multiple Mirador embeds can be included in a given page.

To compate two images _of equal dimensions_:
```
{{< compare left="804now.jpg" right="804then.jpg" left-alt="Giza now" right-alt="Giza then" label="blah">}}
```
The shortcode assumes the images are page resources. Multiple image comparisons can be included in a given page.

# Kiosk data

When getting updated images and json from Kiosk, put everything in the `/assets/kiosk` directory.

## Cleaning/reformatting

In the project root, run `python assets/js/clean_data.py -i assets/kiosk/docs.json -o assets/kiosk/data.json`. This script:

1. removes the wrapping `u2ers_sites` so the values are easier to access
2. removes sites where the `limit_view_to` field is not null, which shouldn't be made public
3. transforms the `at_periods` and `g_earth_damage_cause` field values into arrays, so Hugo can loop through them appropriately (and use at_periods as a taxonomy)
4. transforms the `u2_images_showing_the_site` field, although we're currently not using it.

## Creating geojson

Run the json2geojson.py script in `/assets/js`: ```python assets/js/json2geojson.py -i assets/kiosk/data.json -o static/kiosk.geojson``` to update the geojson.

There has _got_ to be a less stupid way to make the Kiosk images, which should be global resources, published so the `{{ .RelParmalink }}` code works, but for now there is a Secret content page, which publishes all the images in the assets directory.

# To-dos