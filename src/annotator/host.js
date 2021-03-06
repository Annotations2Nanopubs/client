import $ from 'jquery';

// TODO - Convert this to an ES import once the `Guest` class is converted to JS.
// @ts-expect-error
const Guest = require('./guest');

export default class Host extends Guest {
  constructor(element, config) {
    // Some config settings are not JSON-stringifiable (e.g. JavaScript
    // functions) and will be omitted when the config is JSON-stringified.
    // Add a JSON-stringifiable option for each of these so that the sidebar can
    // at least know whether the callback functions were provided or not.
    if (config.services?.length > 0) {
      const service = config.services[0];
      if (service.onLoginRequest) {
        service.onLoginRequestProvided = true;
      }
      if (service.onLogoutRequest) {
        service.onLogoutRequestProvided = true;
      }
      if (service.onSignupRequest) {
        service.onSignupRequestProvided = true;
      }
      if (service.onProfileRequest) {
        service.onProfileRequestProvided = true;
      }
      if (service.onHelpRequest) {
        service.onHelpRequestProvided = true;
      }
    }

    // Make a copy of the config for use by the sidebar app with several
    // annotator-only properties removed. nb. We don't currently strip all the
    // annotator-only properties here. That's OK because validation / filtering
    // happens in the sidebar app itself. It just results in unnecessary content
    // in the sidebar iframe's URL string.
    const sidebarConfig = { ...config };
    ['sidebarAppUrl', 'pluginClasses'].forEach(
      key => delete sidebarConfig[key]
    );

    const configParam =
      'config=' + encodeURIComponent(JSON.stringify(sidebarConfig));

    const sidebarAppSrc = config.sidebarAppUrl + '#' + configParam;

    // Create the iframe
    const app = $('<iframe></iframe>')
      .attr('name', 'hyp_sidebar_frame')
      // enable media in annotations to be shown fullscreen
      .attr('allowfullscreen', '')
      .attr('seamless', '')
      .attr('src', sidebarAppSrc)
      .attr('title', 'Hypothesis annotation viewer')
      .addClass('h-sidebar-iframe');

    let externalContainer = null;

    if (config.externalContainerSelector) {
      // Use the native method to also validate the input
      externalContainer = document.querySelector(
        config.externalContainerSelector
      );
    }

    let externalFrame;
    let frame;

    if (externalContainer) {
      externalFrame = $(externalContainer);
    } else {
      frame = $('<div></div>')
        .css('display', 'none')
        .addClass('annotator-frame annotator-outer');

      if (config.theme === 'clean') {
        frame.addClass('annotator-frame--drop-shadow-enabled');
      }

      frame.appendTo(element);
    }

    // FIXME: We have to call the parent constructor here instead of at the top
    // of the function because it triggers plugin construction and the BucketBar
    // plugin constructor in turn assumes that the `.annotator-frame` element is
    // already in the DOM.
    super(element, config);

    this.externalFrame = externalFrame;
    this.frame = frame;

    app.appendTo(this.frame || this.externalFrame);

    this.on('panelReady', () => {
      // Show the UI
      this.frame?.css('display', '');
    });

    this.on('beforeAnnotationCreated', annotation => {
      // When a new non-highlight annotation is created, focus
      // the sidebar so that the text editor can be focused as
      // soon as the annotation card appears
      if (!annotation.$highlight) {
        app[0].contentWindow.focus();
      }
    });
  }

  destroy() {
    this.frame?.remove();
    super.destroy();
  }
}
