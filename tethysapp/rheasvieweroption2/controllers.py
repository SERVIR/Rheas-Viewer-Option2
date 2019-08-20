from django.shortcuts import render
from tethys_sdk.gizmos import MVView,MVDraw,MapView
import tethysapp.rheasvieweroption2.config as cfg
from django.views.decorators.csrf import csrf_exempt
from tethysapp.rheasvieweroption2.model import *

def home(request):
    """
    Controller for the app home page.
    """
    view_options = MVView(
        projection='EPSG:4326',
        center=[-100, 40],
        zoom=3.5,
        maxZoom=18,
        minZoom=2
    ),
    drawing_options = MVDraw(
        controls=['Point', 'Polygon'],
        initial='Point',
        output_format='WKT'
    ),
    home_map = MapView(
        height='100%',
        width='100%',
        basemap='OpenStreetMap',
	    view=view_options,
        draw=drawing_options,
    )
    rheas_dbs = get_database()
    db_schemas = get_schemas(cfg.connection['dbname'])
    variable_info = get_variables_meta()
    geoserver_wms_url = cfg.geoserver['wms_url']
    geoserver_rest_url = cfg.geoserver['rest_url']
    geoserver_workspace = cfg.geoserver['workspace']
    context = {
        'home_map': home_map,
        "rheas_dbs":rheas_dbs,
        "db_schemas":db_schemas,
        "variable_info":json.dumps(variable_info),
        "geoserver_wms_url":geoserver_wms_url,
        "geoserver_rest_url":geoserver_rest_url,
        "geoserver_workspace":geoserver_workspace
    }

    return render(request, 'rheasvieweroption2/home.html', context)
@csrf_exempt
def vicdssat(request):
    geoserver_wms_url = cfg.geoserver['wms_url']
    geoserver_rest_url = cfg.geoserver['rest_url']
    geoserver_workspace = cfg.geoserver['workspace']
    context={
        "geoserver_wms_url":geoserver_wms_url,
        "geoserver_rest_url":geoserver_rest_url,
        "geoserver_workspace":geoserver_workspace
    }
    return render(request,'rheasvieweroption2/vicdssat.html', context)
