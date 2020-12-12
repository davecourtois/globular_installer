
//import { ConfigurationApplication } from "./src/configuration"
import "./css/styles.css"
import { Model } from "globular-mvc/Model"
import { InstallationWizard } from "./src/installationWizard"

/**
 * The main entry point of an applicaition.
 */
function main() {

    // First thing I will do is test if the server is configure...
    let model = new Model
    
    model.init( window.location.origin + "/config",
        () => {
        // Test if the server is configure or not...
        console.log(Model.eventHub)
        let installationWizard = new InstallationWizard(document.getElementById("workspace"))
    }, (err: any) => {

    })

}

/**
 * The main function will be call a the end of document initialisation.
 */
document.addEventListener("DOMContentLoaded", function (event) {
    main()
})
