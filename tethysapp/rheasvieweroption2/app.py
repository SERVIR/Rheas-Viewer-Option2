from tethys_sdk.base import TethysAppBase, url_map_maker

class Rheasvieweroption2(TethysAppBase):
    """
    Tethys app class for wer.
    """

    name = 'RHEAS Viewer Beta'
    index = 'rheasvieweroption2:home'
    icon = 'rheasvieweroption2/images/logo.png'
    package = 'rheasvieweroption2'
    root_url = 'rheasvieweroption2'
    color = '#f39c12'
    description = 'Integration of VIC and DSSAT in to RHEAS Viewer'
    tags = 'VIC,DSSAT'
    enable_feedback = False
    feedback_emails = []


    def url_maps(self):
        """
        Add controllers
        """
        UrlMap = url_map_maker(self.root_url)

        url_maps = (
            UrlMap(
                name='home',
                url='rheasvieweroption2',
                controller='rheasvieweroption2.controllers.vicdssat'
            ),
            UrlMap(
                name='vicdssat',
                url='rheasvieweroption2/vicdssat',
                controller='rheasvieweroption2.controllers.home'
            ),
            UrlMap(
                name='outlook',
                url='rheasvieweroption2/outlook',
                controller='rheasvieweroption2.controllers.outlook'
            ),

            UrlMap(
                name='schemas',
                url='rheasvieweroption2/vicdssat/schemas',
                controller='rheasvieweroption2.ajax_controllers.get_db_schemas'
            ),
            UrlMap(
                name='api-schemas',
                url='rheasvieweroption2/api/getVICSchemas',
                controller='rheasvieweroption2.api.api_get_db_schemas'
            ),
            UrlMap(
                name='variables',
                url='rheasvieweroption2/vicdssat/variables',
                controller='rheasvieweroption2.ajax_controllers.get_vars'
            ),
            UrlMap(
                name='api-variables',
                url='rheasvieweroption2/api/getVICVariables',
                controller='rheasvieweroption2.api.api_get_vars'
            ),
            UrlMap(
                name='dates',
                url='rheasvieweroption2/vicdssat/dates',
                controller='rheasvieweroption2.ajax_controllers.get_dates'
            ),
            UrlMap(
                name='dates1',
                url='rheasvieweroption2/dates',
                controller='rheasvieweroption2.ajax_controllers.get_dates'
            ),
            UrlMap(
                name='api-dates',
                url='rheasvieweroption2/api/getVICDates',
                controller='rheasvieweroption2.api.api_get_dates'
            ),
            UrlMap(
                name='get-vic-plot',
                url='rheasvieweroption2/vicdssat/get-vic-plot',
                controller='rheasvieweroption2.ajax_controllers.get_vic_plot'
           ),
            UrlMap(
                name='get-vic-nc',
                url='rheasvieweroption2/vicdssat/get-vic-nc',
                controller='rheasvieweroption2.ajax_controllers.get_vic_nc'
            ),
           UrlMap(
                name='raster',
                url='rheasvieweroption2/vicdssat/raster',
                controller='rheasvieweroption2.ajax_controllers.get_raster'
          ),
          UrlMap(
                name='scale',
                url='rheasvieweroption2/vicdssat/scale',
                controller='rheasvieweroption2.ajax_controllers.get_scale'
          ),
          UrlMap(
                name='scale1',
                url='rheasvieweroption2/scale1',
                controller='rheasvieweroption2.ajax_controllers.get_scale'
          ),
           UrlMap(
                name='raster1',
                url='rheasvieweroption2/raster1',
                controller='rheasvieweroption2.ajax_controllers.get_raster'
          ),
          UrlMap(
                name='bounds',
                url='rheasvieweroption2/vicdssat/bounds',
                controller='rheasvieweroption2.ajax_controllers.get_bounds'
          ),
          UrlMap(
                name='bounds1',
                url='rheasvieweroption2/bounds1',
                controller='rheasvieweroption2.ajax_controllers.get_bounds'
          ),
          UrlMap(
                name='boundshome',
                url='rheasvieweroption2/vicdssat/boundshome',
                controller='rheasvieweroption2.ajax_controllers.get_bounds'
          ),
          UrlMap(
                name='dsyield',
                url='rheasvieweroption2/get-schema-yield',
                controller='rheasvieweroption2.ajax_controllers.get_schema_yield'
          ),

          UrlMap(
                name='dsyield1',
                url='rheasvieweroption2/vicdssat/get-schema-yield',
                controller='rheasvieweroption2.ajax_controllers.get_schema_yield'
          ),

          UrlMap(
                name='dsyieldgid',
                url='rheasvieweroption2/vicdssat/get-schema-yield-gid',
                controller='rheasvieweroption2.ajax_controllers.get_schema_yield_gid'
          ),
          UrlMap(
                name='dsensemble',
                url='rheasvieweroption2/vicdssat/get-ensemble',
                controller='rheasvieweroption2.ajax_controllers.get_ensemble'
          ),
          UrlMap(
                name='dsensval',
                url='rheasvieweroption2/vicdssat/get-ens-values',
                controller='rheasvieweroption2.ajax_controllers.get_ens_values'
          ),
          UrlMap(
                name='getcounty',
                url='rheasvieweroption2/vicdssat/get-county',
                controller='rheasvieweroption2.ajax_controllers.get_county'
          ),
          UrlMap(
                name='api-dsyield',
                url='rheasvieweroption2/api/getDSSATYield',
                controller='rheasvieweroption2.api.api_get_schema_yield'
          ),
        )

        return url_maps