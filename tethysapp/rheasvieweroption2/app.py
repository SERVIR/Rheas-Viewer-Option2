from tethys_sdk.base import TethysAppBase, url_map_maker


class Rheasvieweroption2(TethysAppBase):
    """
    Tethys app class for wer.
    """

    name = 'wer'
    index = 'rheasvieweroption2:home'
    icon = 'rheasvieweroption2/images/icon.gif'
    package = 'rheasvieweroption2'
    root_url = 'rheasvieweroption2'
    color = '#f39c12'
    description = 'Integration of VIC and DSSAT in to on Viewer'
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
        )

        return url_maps
