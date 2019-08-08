from tethys_sdk.base import TethysAppBase, url_map_maker


class Rheasvieweroption2(TethysAppBase):
    """
    Tethys app class for wer.
    """

    name = 'RHEAS Viewer'
    index = 'rheasvieweroption2:home'
    icon = 'rheasvieweroption2/images/icon.gif'
    package = 'rheasvieweroption2'
    root_url = 'rheasvieweroption2'
    color = '#f39c12'
    description = 'Integration of VIC and DSSAT in to RHEAS Viewer'
    tags = '&quot;VIC&quot;,&quot;DSSAT&quot;'
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
                controller='rheasvieweroption2.controllers.home'
            ),
            UrlMap(
                name='schemas',
                url='rheasvieweroption2/schemas',
                controller='rheasvieweroption2.ajax_controllers.get_db_schemas'
            ),
            UrlMap(
                name='api-schemas',
                url='rheasvieweroption2/api/getVICSchemas',
                controller='rheasvieweroption2.api.api_get_db_schemas'
            ),
            UrlMap(
                name='variables',
                url='rheasvieweroption2/variables',
                controller='rheasvieweroption2.ajax_controllers.get_vars'
            ),
            UrlMap(
                name='api-variables',
                url='rheasvieweroption2/api/getVICVariables',
                controller='rheasvieweroption2.api.api_get_vars'
            ),
            UrlMap(
                name='dates',
                url='rheasvieweroption2/dates',
                controller='rheasvieweroption2.ajax_controllers.get_dates'
            ),
            UrlMap(
                name='api-dates',
                url='rheasvieweroption2/api/getVICDates',
                controller='rheasvieweroption2.api.api_get_dates'
            ),
        )

        return url_maps
