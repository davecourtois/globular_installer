import { Application } from "globular-mvc/Application";
import { ApplicationView } from "globular-mvc/ApplicationView";

/**
 * The configuration panel view.
 */
export class ConfigurationPanel extends ApplicationView {
    constructor() {
        super();
    }

    init() {
        // Append the wizard in the page.
    }
    
}

/**
 * The configuration view.
 */
export class ConfigurationApplication extends Application {

    constructor() {
        let view = new ConfigurationPanel();

        super("globular_panel", "Globular Configuration Panel", view)
    }
}