VIZABI_MODEL = {
  "state": {
    "time": {
      "startOrigin": "1993",
      "endOrigin": "2015",
      "value": "2000",
      "dim": "year",
      "delay": 700
    },
    "entities": {
      "dim": "basomrade",
      "filter": {"basomrade": {"size": "big"}},
      "show": {}
    },
    "entities_colorlegend": {
      "dim": "municipality"
    },
    "entities_map_colorlegend": {
      "dim": "municipality"
    },
    "marker": {
      "space": ["entities", "time"],
      "label": {
        "use": "property",
        "which": "name"
      },
      "hook_centroid": {
        "use": "property",
        "which": "baskod2010",
        "_important": true
      },
      "size": {
        "which": "population_20xx_12_31",
        "use": "indicator",
        "scaleType": "linear",
        "extent": [0, 0.4],
        "allow": {
          "scales": ["linear"]
        }
      },
      "color": {
        "use": "indicator",
        "which": "mean_income_aged_gt_20",
        "scaleType": "log",
        "syncModels": ["marker_colorlegend"]
      },
      "color_map": {
        "use": "property",
        "which": "municipality",
        "scaleType": "ordinal",
        "syncModels": ["marker_colorlegend"]
      }
    },
    "marker_colorlegend": {
      "space": ["entities_colorlegend"],
      "opacityRegular": 0.8,
      "opacityHighlightDim": 0.3,
      "label": {
        "use": "property",
        "which": "name"
      },
      "hook_rank": {
        "use": "property",
        "which": "rank"
      },
      "hook_geoshape": {
        "use": "property",
        "which": "shape_lores_svg"
      }
    }
  },
  "ui": {
    datawarning: {
      doubtDomain: [2000, 2014],
      doubtRange: [0, 0]
    },
    "map": {
      "scale": 1,
      "preserveAspectRatio": true,
      "mapEngine": "mapbox",
      "mapStyle": "mapbox://styles/mapbox/light-v9",
      "showBubbles": true,
      "showAreas": false,
      "showMap": true,
      "offset": {
        "top": 0.05,
        "bottom": -0.12,
        "left": 0,
        "right": 0
      },
      "path": null,
      "bounds": {
        "north": 59.48,
        "west": 17.72,
        "south": 59.21,
        "east": 18.32
      },
      "projection": "mercator",
      "topology": {
        "path": "assets/sodertorn-basomr2010.json",
        "objects": {
          "geo": "c1e171fae817c0bfc26dc7df82219e08",
          "boundaries": "c1e171fae817c0bfc26dc7df82219e08"
        },
        "geoIdProperty": "BASKOD2010"
      }
    },
    "splash": true
  }
};
