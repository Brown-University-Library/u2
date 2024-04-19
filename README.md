The U2 Egypt project aims to digitize a series of recently declassified aerial photographs that document the Nile Delta and Nile Valley. Shot by U2 spy planes, this imagery provides much higher resolution images than any currently available imagery (for instance the CORONA satellite imagery that has revolutionized archaeology in this area in the past two decades), and shows the landscape prior to the construction of the Aswan High Dam.

This repo contains the website which contextualizes the images, provides gepgraphical information about them, and describes the project.

# Specs

This site is built in Hugo. The command to build the site for the development server, including drafts, is ```hugo -e development -D --minify --cleanDestinationDir -b /projects/u2egypt```. The command to build the site for production is ```hugo -e production -D --minify --cleanDestinationDir```.

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

# To-dos

- write geojson for the BDR items including BDR pids
- add the https://github.com/IvanSanchez/Leaflet.ImageOverlay.Rotated plugin
