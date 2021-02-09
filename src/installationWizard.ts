import { GetConfigResponse, SaveConfigRequest, SetRootEmailRequest, SetRootPasswordRequest, GetConfigRequest} from "globular-web-client/admin/admin_pb";
import { AuthenticateRqst, AuthenticateRsp } from "globular-web-client/resource/resource_pb";
import { Wizard } from "globular-mvc/components/Wizard";
import { Model } from "globular-mvc/Model";

export class InstallationWizard {

    private wiz: Wizard;
    private new_email: string;
    private admin_pwd: string;
    private domains: Array<string>;
    private dnsUpdateIpInfos: Array<any>;

    constructor(parent: any) {
        this.wiz = new Wizard()
        this.wiz.style.paddingTop = "5%"
        this.wiz.width = 500

        parent.appendChild(this.wiz)

        // The introduction page.
        this.createIntroductionPage()

        // The admin setup page.
        this.createAdminSetupPage()

        // The web-server setup.
        this.createApplicationServerSetupPage()

        // The certificate 
        this.createCertificateHeaderSetupPage()

        // The domain setup.
        this.createDomainSetupPage()

        // Now the summary page...
        this.appendSummaryPage()


        // Here I will react to next page event to manage 
        // if the next step can be access or not.
        Model.eventHub.subscribe("wizard_next_page_evt", (uuid: string) => { }, (evt: any) => {
            // Page validation code.
            if (evt.index == 1) {
                setTimeout(() => {
                    // Set the focus to the email input if it value is the default one.
                    let emailInput = <any>this.wiz.getElementById("admin_email_address_input");
                    if (emailInput.inputElement.value == "globular@globular.app") {
                        emailInput.focus()
                        let input = emailInput.inputElement.firstChild.nextSibling
                        input.select()
                    } else {
                        // Set the focus to admin password
                        let adminPwd = <any>this.wiz.getElementById("admin_password")
                        if (adminPwd.inputElement.value.length == 0) {
                            adminPwd.focus()
                        }
                    }


                }, 700) // timeout must be greather than ht e

                this.wiz.disableNextBtn();

            } else if (evt.index == 2) {
                let emailInput = <any>this.wiz.getElementById("admin_email_address_input");
                this.new_email = <string>emailInput.inputElement.value;
                setTimeout(() => {
                    let serverNameInput = <any>this.wiz.getElementById("server_name_input");
                    let input = serverNameInput.inputElement.firstChild.nextSibling
                    input.select()
                }, 700)
            } else if (evt.index == 3) {
                let admin_pwd = <any>this.wiz.getElementById("admin_password");
                this.admin_pwd = <string>admin_pwd.inputElement.value;
            }
        }, true)




    }

    private appendPage(innerHTML: string): any {
        let div = document.createElement("div")
        div.innerHTML = innerHTML;
        this.wiz.appendPage(div)
        return div;
    }

    /** Create the introduction page. */
    private createIntroductionPage() {

        let html = `
        <h2>Welcome to Globular!</h2>
        <img style="align-self: center; width: 250px;" src="images/puffer.svg"></img>
        <p>This wizard will guide you in the installation of your server.</p>
        `
        // create the page
        let div = this.appendPage(html)

        // set style attribute for the page to display correctly...
        div.style.display = "flex"
        div.style.alignItems = "center"
        div.style.flexDirection = "column"

    }


    /** Create Admin setup page */
    private createAdminSetupPage() {
        let html =
            `
        <h2>Admin Setup</h2>
        <span style="font-style: italic;">But are you still "Master of your Domain?"</span><br>
        <span style="font-style: italic; font-size: .8em">Seinfeld</span>
        <p>
            The first thing to do is to secure your server by changing the admin email and admin password (<span style="font-style: italic;">"adminadmin"</span> by defaut.).
        </p>
        <h3>
            Admin Email 
            <paper-icon-button id="email_info" icon="info" alt="information"></paper-icon-button>
        </h3>
        <paper-tooltip tabindex="-1" for="email_info" position="right" animation-delay="250" animation-entry="scale-up-animation" animation-exit="scale-down-animation">
            <p>
                The administrator email can be any well formed email address. 
            </p>
            <p>
                By using active email address it 
                became posible to receive alert or notification 
                from your server when something happen.
            </p>
        </paper-tooltip>
        <paper-input value="globular@globular.app" type="email" id="admin_email_address_input" required label="email" pattern="^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$" error-message="not well formed email!"></paper-input>

        <h3>
            Admin Password
            <paper-icon-button id="password_info" icon="info" alt="information"></paper-icon-button>
        </h3>
        <paper-input id="admin_password" type="password" required label="password" pattern="" error-message="error"></paper-input>
        <paper-input id="admin_password_confirm" type="password" required label="confirm password" pattern="" error-message="error"></paper-input>

        <paper-tooltip for="password_info" tabindex="-1" position="right" animation-delay="250" animation-entry="scale-up-animation" animation-exit="scale-down-animation">
            <p>
                The admin password will be save in the configuration file 
            </p>
            <span style="font-style: italic; font-size: 1.4em;">installation_folder/config/config.json</span>
            <p>
                For that reason you must restrict the access of that file on your server.
            <p>
                * If you forgot your password you will be able to retreive it from that file.
            </p>
        </paper-tooltip>
        `
        this.appendPage(html)

        // Here I will set the password validation.
        let passwordInput = <any>this.wiz.getElementById("admin_password")
        let confirmPasswordInput = <any>this.wiz.getElementById("admin_password_confirm")

        passwordInput.onkeyup = (evt: any) => {
            if (evt.keyCode == 9 || evt.keyCode == 13) {
                let input = passwordInput.inputElement.firstChild.nextSibling
                if (input.value.length < 6 && input.value.length > 0) {
                    evt.preventDefault()
                    let paperInputError = passwordInput.inputElement.parentNode.getElementsByTagName("paper-input-error")[0]
                    paperInputError.innerHTML = "The password must have a minimum of 6 character."
                    passwordInput.inputElement.setAttribute("invalid")
                } else if (input.value.length >= 6) {
                    setTimeout(() => {
                        confirmPasswordInput.focus()
                    }, 100)

                }
            }
        }

        passwordInput.onblur = (evt: any) => {
            let input = passwordInput.inputElement.firstChild.nextSibling
            if (input.value.length < 6) {
                evt.preventDefault()
                let paperInputError = passwordInput.inputElement.parentNode.getElementsByTagName("paper-input-error")[0]
                paperInputError.innerHTML = "The password must have a minimum of 6 character."
                passwordInput.inputElement.setAttribute("invalid")
            }
        }

        passwordInput.onkeydown = (evt: any) => {
            if (evt.keyCode == 9 || evt.keyCode == 13) {
                evt.preventDefault()
            }

            passwordInput.inputElement.removeAttribute("invalid")
        }

        confirmPasswordInput.onkeydown = (evt: any) => {
            if (evt.keyCode == 9 || evt.keyCode == 13) {
                evt.preventDefault()
            }
            confirmPasswordInput.inputElement.removeAttribute("invalid")
        }

        confirmPasswordInput.onkeyup = (evt: any) => {
            if (evt.keyCode == 9 || evt.keyCode == 13) {
                if (confirmPasswordInput.inputElement.value != passwordInput.inputElement.value) {
                    let paperInputError = confirmPasswordInput.inputElement.parentNode.getElementsByTagName("paper-input-error")[0]
                    paperInputError.innerHTML = "The password dosen't match!"
                    confirmPasswordInput.inputElement.setAttribute("invalid")
                    this.wiz.disableNextBtn()
                } else {
                    // In that case the password match...
                    this.wiz.enableNextBtn()
                    this.wiz.nexBtn.click()
                }
            } else if (confirmPasswordInput.inputElement.value == passwordInput.inputElement.value) {
                this.wiz.enableNextBtn()
            } else {
                this.wiz.disableNextBtn()
            }
        }

        confirmPasswordInput.onblur = (evt: any) => {
            if (confirmPasswordInput.inputElement.value != passwordInput.inputElement.value) {
                let paperInputError = confirmPasswordInput.inputElement.parentNode.getElementsByTagName("paper-input-error")[0]
                paperInputError.innerHTML = "The password dosen't match!"
                confirmPasswordInput.inputElement.setAttribute("invalid")
                this.wiz.disableNextBtn()
            } else {
                // In that case the password match...
                this.wiz.enableNextBtn()
            }
        }

    }

    /** Create the http server configuration */
    private createApplicationServerSetupPage() {

        let html = `
        <h2>Web Application Server Setup</h2>
        <p>
            We will now configure the basic properties of your server.
        </p>
        <h3>
            Name
            <paper-icon-button id="name_info" icon="info" alt="information"></paper-icon-button>
        </h3>
        <paper-tooltip for="name_info" tabindex="-1" position="right" animation-delay="250" animation-entry="scale-up-animation" animation-exit="scale-down-animation">
            <p>Your server name can be usefull if you have more than one server installed on your network. So be original!</p>
        </paper-tooltip>
        <div>
            <paper-input id="server_name_input" label="Name" value="MyGlobule"></paper-input>
        </div>
        <h3>
            Ports Range
            <paper-icon-button id="ports_range_info" icon="info" alt="information"></paper-icon-button>
        </h3>
        <paper-tooltip for="ports_range_info" tabindex="-1" position="right" animation-delay="250" animation-entry="scale-up-animation" animation-exit="scale-down-animation">
            <p>Each micro-services will need tow ports, one for gRpc and one for it reverse proxy. The range must be contiguous, if port in the range are busy it will simply be ignore and skip.</p>
            <p>By using a large number as starting number can lower chance of conflict with other applications. Avoid using port number lower than 1000.</p>
            <p>* Don't forget to set your firewall and your router with the same port range in order to give access to external clients.</p>
        </paper-tooltip>
        <div style="display: flex; justify-content: space-between;">
            <paper-input id="start_port_range_input" label="From" type="number" value="10000"></paper-input>
            <paper-input id="end_port_range_input" label="To" type="number" value="10100"></paper-input>
        </div>
        <h3>
            Http
            <paper-icon-button id="http_range_info" icon="info" alt="information"></paper-icon-button>
        </h3>
        <paper-tooltip for="http_range_info" tabindex="-1" position="right" animation-delay="250" animation-entry="scale-up-animation" animation-exit="scale-down-animation">
            <p>If you plan to use Globular as a webserver you should keep default values. Any other ports like 8080 and 8443 can be use...</p>
            <p>You Don't have to worry about TLS certificates, Globular with help of Let's Encrypt will take care of it.</p>
        </paper-tooltip>
        <div style="display: flex; align-items: center;">
            <span>Protocol</span>
            <paper-radio-group selected="https">
                <paper-radio-button id="http" name="http">Http</paper-radio-button>
                <paper-radio-button id="https" name="https">Https</paper-radio-button>
            </paper-radio-group>
        </div>
        <div style="display: flex; justify-content: space-between;">
            <paper-input id="http_port_input" label="http port" type="number" value="80"></paper-input>
            <paper-input id="https_port_input" label="https port" type="number" value="443"></paper-input>
        </div>
        `
        // create the page
        let div = this.appendPage(html)

        // set style attribute for the page to display correctly...
        div.style.display = "flex"
        div.style.flexDirection = "column"

        // Fix change page...
        this.wiz.getElementById("https_port_input").onkeydown = (evt: any) => {
            if (evt.keyCode == 9 || evt.keyCode == 13) {
                evt.preventDefault()
                this.wiz.nexBtn.click()
                setTimeout(() => {
                    this.wiz.getElementById("organization_input").focus()
                }, 750)
            }
        }
    }

    createCertificateHeaderSetupPage() {
        let html = `
        <h2>Certificate informations</h2>
        <p>
            We will now enter TLS certificate informations. Those informations will be use
            to generate Certificate Signing Request(CSR).
        </p>

        <div style="display: flex; align-items: center;">
            <paper-icon-button id="organization_info" icon="info" alt="information"></paper-icon-button>
            <paper-input style="flex-grow: 1;" id="organization_input" label="Organization(O)" value=""> </paper-input>
        </div>
        <paper-tooltip for="organization_info" tabindex="-1" position="right" animation-delay="250" animation-entry="scale-up-animation" animation-exit="scale-down-animation">
            <p>The legal name of your organization. Do not abbreviate and include any suffixes, such as Inc., Corp., or LLC.</p>
            <p>For EV and OV SSL Certificates, this information is verified by the CA and included in the certificate.</p>
        </paper-tooltip>

        <div style="display: flex; align-items: center;">
            <paper-icon-button id="city_info" icon="info" alt="information"></paper-icon-button>
            <paper-input style="flex-grow: 1;" id="city_input" label="City/Locality(L)" value=""> </paper-input>
        </div>
        <paper-tooltip for="city_info" tabindex="-1" position="right" animation-delay="250" animation-entry="scale-up-animation" animation-exit="scale-down-animation">
            <p>The city where your organization is located. This shouldn’t be abbreviated.</p>
        </paper-tooltip>

        <div style="display: flex; align-items: center;">
            <paper-icon-button id="state_info" icon="info" alt="information"></paper-icon-button>
            <paper-input style="flex-grow: 1;" id="state_input" label="State/County/Region (S)" value=""> </paper-input>
        </div>
        <paper-tooltip for="state_info" tabindex="-1" position="right" animation-delay="250" animation-entry="scale-up-animation" animation-exit="scale-down-animation">
            <p>The state/region where your organization is located. This shouldn't be abbreviated.</p>
        </paper-tooltip>


        <div style="display: flex; align-items: center;">
            <paper-icon-button id="country_info" icon="info" alt="information"></paper-icon-button>
            <paper-input style="flex-grow: 1;" id="country_input" label="Country (C)" value=""> </paper-input>
        </div>
        <paper-tooltip for="country_info" tabindex="-1" position="right" animation-delay="250" animation-entry="scale-up-animation" animation-exit="scale-down-animation">
            <p>The two-letter code for the country where your organization is located.</p>
        </paper-tooltip>
        `
        // create the page
        let div = this.appendPage(html)

        // set style attribute for the page to display correctly...
        div.style.display = "flex"
        div.style.flexDirection = "column"

        // Fix change page...
        this.wiz.getElementById("country_input").onkeydown = (evt: any) => {
            if (evt.keyCode == 9 || evt.keyCode == 13) {
                evt.preventDefault()
                this.wiz.nexBtn.click()
                setTimeout(() => {
                    let domainNameInput = <any>this.wiz.getElementById("domain_name_input")
                    domainNameInput.focus()
                    setTimeout(() => {
                        let input = domainNameInput.inputElement.firstChild.nextSibling
                        input.select()
                    }, 100)

                }, 750)
            }
        }
    }

    private createDomainSetupPage() {

        let html = `
        <h2>Domain(s) Setup</h2>
        <p>
            It's now time to configure your domain(s).
        </p>

        <div style="display: flex; align-items: center;">
            <paper-icon-button id="domain_name_info" icon="info" alt="information"></paper-icon-button>
            <paper-input style="flex-grow: 1;" id="domain_name_input" label="domain" value="localhost" error-message="error!"></paper-input>
            <paper-tooltip for="domain_name_info" tabindex="-1" position="right" animation-delay="250" animation-entry="scale-up-animation" animation-exit="scale-down-animation">
                <p>Each server instance can be accessible by one or more domain(address). That's mean
                each or your application can have it own domain. If no domain was given <span style="font-style: italic;">localhost</span> will be taken as default.</p>
                <p>Domain name can be local, or global. In case of a local domain name certificate must be manage manualy. </p>
            </paper-tooltip>
        </div>
        <div id="ip_update_div" style="display: none;">
            <div style="display: flex; align-items: center;">
                <paper-icon-button id="ip_update_info" icon="info" alt="information"></paper-icon-button>
                <paper-toggle-button id="ip_update_toggle" style="flex-grow: 1;">dynamic ip</paper-toggle-button>
                <paper-tooltip for="ip_update_info" tabindex="-1" position="right" animation-delay="250" animation-entry="scale-up-animation" animation-exit="scale-down-animation">
                    <p>Here goes necessary information to automaticaly update your Ip address whit your internet domain registrar.</p>
                    <p>* Note, that will only work if your internet domain registrar offer some kind of web-api. (tested with goDaddy)</p>
                </paper-tooltip>
                <paper-icon-button id="add_domain_btn" icon="add-box">Add</paper-icon-button>
            </div>
            <div id="ip_update_info_div" style="display: none; padding-left: 15px;">
                <div style="display: flex; align-items: center;">
                    <paper-icon-button id="set_A_info" icon="info" alt="information"></paper-icon-button>
                    <paper-input style="flex-grow: 1;" id="set_A_input" label="SetA" value="" error-message="error!"> </paper-input>
                </div>
                <paper-tooltip for="set_A_info" tabindex="-1" position="right" animation-delay="250" animation-entry="scale-up-animation" animation-exit="scale-down-animation">
                    <p>This is the web api function to set the A(Adress) DNS record.</p>
                    <p><span style="font-style: italic; font-size: .9em;">https://api.godaddy.com/v1/domains/your.domain.com/records/A/@</span></p>
                </paper-tooltip>
                <div style="display: flex; align-items: center;">
                    <paper-icon-button id="secret_info" icon="info" alt="information"></paper-icon-button>
                    <paper-input style="flex-grow: 1;" id="secret_input" label="Secret" value="" error-message="error!"> </paper-input>
                </div>
                <paper-tooltip for="secret_info" tabindex="-1" position="right" animation-delay="250" animation-entry="scale-up-animation" animation-exit="scale-down-animation">
                    <p>This is a secret generate by your internet domain registrar</p>
                </paper-tooltip>
                <div style="display: flex; align-items: center;">
                    <paper-icon-button id="key_info" icon="info" alt="information"></paper-icon-button>
                    <paper-input style="flex-grow: 1;" id="key_input" label="Key" value="" error-message="error!"> </paper-input>
                </div>
                <paper-tooltip for="key_info" tabindex="-1" position="right" animation-delay="250" animation-entry="scale-up-animation" animation-exit="scale-down-animation">
                    <p>This is a key associated with the secret and generate by your internet domain registrar</p>
                </paper-tooltip>
            </div>
        </div>
        <div id="domains_div" style="padding: 20px;">
            
        </div>
        `
        // create the page
        let div = this.appendPage(html)

        let addDomainBtn = <any>this.wiz.getElementById("add_domain_btn")
        let domainNameInput = <any>this.wiz.getElementById("domain_name_input")
        let domainsDiv = <any>this.wiz.getElementById("domains_div")

        domainNameInput.onkeyup = (evt: any) => {
            if (evt.keyCode == 13) {
                addDomainBtn.click()
                return
            }
            let input = domainNameInput.inputElement.firstChild.nextSibling
            if (input.value != "localhost" && input.value.length > 0) {
                // Here I will display the update ip div.
                this.wiz.getElementById("ip_update_div").style.display = "block"
            } else {
                this.wiz.getElementById("ip_update_div").style.display = "none"
            }
            // Hide the invalid error.
            domainNameInput.inputElement.removeAttribute("invalid")
        }

        let ipUpdateToggle = this.wiz.getElementById("ip_update_toggle")

        let setAInput = <any>this.wiz.getElementById("set_A_input")
        let setAInput_ = setAInput.inputElement.firstChild.nextSibling
        let setSecretInput = <any>this.wiz.getElementById("secret_input")
        let setSecretInput_ = setSecretInput.inputElement.firstChild.nextSibling
        let setKeyInput = <any>this.wiz.getElementById("key_input")
        let setKeyInput_ = setKeyInput.inputElement.firstChild.nextSibling

        const config = { attributes: true, childList: true, subtree: true };
        const observer = new MutationObserver(() => {
            let div = this.wiz.getElementById("ip_update_info_div")
            if (ipUpdateToggle.hasAttribute("checked")) {
                if (div.style.display != "block") {
                    div.style.display = "block"
                    setAInput.focus()
                }
            } else {
                div.style.display = "none"
                addDomainBtn.removeAttribute("disabled")
            }
        });

        // Remove previous error when the user enter new value.
        setAInput.onkeyup = () => {
            setAInput.inputElement.removeAttribute("invalid")
        }

        setKeyInput.onkeyup = () => {
            setKeyInput.inputElement.removeAttribute("invalid")
        }

        setSecretInput.onkeyup = () => {
            setSecretInput.inputElement.removeAttribute("invalid")
        }

        observer.observe(ipUpdateToggle, config);

        // Now I will append the entered domain info into the list...
        addDomainBtn.onclick = () => {
            let input = domainNameInput.inputElement.firstChild.nextSibling

            let domain = input.value
            let setA = setAInput_.value
            let secret = setSecretInput_.value
            let key = setKeyInput_.value

            const regex = RegExp('^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$')

            if (regex.test(domain) == false) {
                domainNameInput.focus()
                let paperInputError = domainNameInput.inputElement.parentNode.getElementsByTagName("paper-input-error")[0]
                paperInputError.innerHTML = "The given domain is not valid!"
                domainNameInput.inputElement.setAttribute("invalid")
                input.select()
                return
            }

            // validate all field are inform.
            if (ipUpdateToggle.hasAttribute("checked")) {
                if (setA.length == 0) {
                    setAInput.focus()
                    let paperInputError = setAInput.inputElement.parentNode.getElementsByTagName("paper-input-error")[0]
                    paperInputError.innerHTML = "No Api function was given!"
                    setAInput.inputElement.setAttribute("invalid")
                    return
                }
                if (secret.length == 0) {
                    setSecretInput.focus()
                    let paperInputError = setSecretInput.inputElement.parentNode.getElementsByTagName("paper-input-error")[0]
                    paperInputError.innerHTML = "No secret value was given!"
                    setSecretInput.inputElement.setAttribute("invalid")
                    return
                }
                if (key.length == 0) {
                    setKeyInput.focus()
                    let paperInputError = setKeyInput.inputElement.parentNode.getElementsByTagName("paper-input-error")[0]
                    paperInputError.innerHTML = "No key value was given!"
                    setKeyInput.inputElement.setAttribute("invalid")
                    return
                }
            }

            // Here I will append the value in the list of domains.
            let domainDiv = <any>document.createElement("div")
            domainDiv.style.display = "flex"
            domainDiv.className = "domain_div"
            domainDiv.innerHTML = `
            <span style="flex-grow: 1;">${domain}</span><paper-icon-button icon="remove"></paper-icon-button>
            `

            // keep value in the dom element itself...
            domainDiv.domain = domain
            domainDiv.setA = setA
            domainDiv.key = key
            domainDiv.secret = secret

            domainDiv.childNodes[2].onclick = () => {
                // remove itself from it parent.
                domainDiv.parentNode.removeChild(domainDiv)
            }

            domainsDiv.appendChild(domainDiv)

            // clear all value...
            input.value = ""

            setAInput_.value = ""
            setKeyInput_.value = ""
            setSecretInput_.value = ""

            ipUpdateToggle.removeAttribute("checked")
            input.focus() // set back the focus to the domain entry box.
        }

        // set style attribute for the page to display correctly...
        div.style.display = "flex"
        div.style.flexDirection = "column"
    }

    // In the summury I will execute various action and display result...
    appendSummaryPage() {

        let innerHTML = `
        <h2>Final Step</h2>
        <h3>
            Apply the configuration...
        </h3>
        <p>
            I will now apply all value from previous to your server configuration.
        </p>

        <div style="display: flex; align-items: center;">
            <span style="flex-grow: 1; font-size: 1.2em;">Set the admin email</span>
            <paper-icon-button style="display: none;" id="set_admin_email_done" disable icon="done" alt="information"></paper-icon-button>
            <paper-spinner style="padding: 8px;" active id="set_admin_email_wait"></paper-spinner>
        </div>
        
        <div style="display: flex; align-items: center;">
            <span style="flex-grow: 1; font-size: 1.2em;">Set the admin password</span>
            <paper-icon-button  style="display: none;"  id="set_admin_pwd_done" disable icon="done" alt="information"></paper-icon-button>
            <paper-spinner style="display: none; padding: 8px;" id="set_admin_pwd_wait"></paper-spinner>
        </div>

        <div style="display: flex; align-items: center;">
            <span style="flex-grow: 1; font-size: 1.2em;">Save and apply new configurations</span>
            <paper-icon-button  style="display: none;"  id="save_apply_config_done" disable icon="done" alt="information"></paper-icon-button>
            <paper-spinner style="display: none; padding: 8px;" id="save_apply_config_wait"></paper-spinner>
        </div>

        <div style="display: flex; align-items: center;">
            <span style="flex-grow: 1; font-size: 1.2em;">Wait for the server to restart</span>
            <paper-icon-button  style="display: none;"  id="wait_server_restart_done" disable icon="done" alt="information"></paper-icon-button>
            <paper-spinner style="display: none; padding: 8px;" id="wait_server_restart_wait"></paper-spinner>
        </div>
      `

        let div = <any>document.createElement("div")
        div.style.minHeight = "500px"
        div.innerHTML = innerHTML;

        // Set the summuray page.
        this.wiz.setSummaryPage(div)

        this.wiz.ondone = () => {
            setTimeout(() => {
                let divs = this.wiz.getElementsByClassName("domain_div")
                for (var i = 0; i < divs.length; i++) {
                    if (this.domains == undefined) {
                        this.domains = new Array<string>()
                    }
                    let div = <any>divs[i]
                    this.domains.push(div.domain)

                    if (div.key != undefined) {
                        if (this.dnsUpdateIpInfos == undefined) {
                            this.dnsUpdateIpInfos = new Array<any>();
                        }
                        this.dnsUpdateIpInfos.push({ Key: div.key, Secret: div.secret, SetA: div.setA })
                    }
                }

                // The first action to do is to set the admin email.
                let rqst = new SetRootEmailRequest()
                rqst.setNewemail(this.new_email)
                rqst.setOldemail(Model.globular.config.AdminEmail)

                Model.globular.adminService.setRootEmail(rqst, { domain: Model.domain, application: Model.application }).
                    then(() => {
                        setTimeout(() => {
                            this.wiz.getElementById("set_admin_email_wait").removeAttribute("active");
                            this.wiz.getElementById("set_admin_email_wait").style.display = "none";
                            this.wiz.getElementById("set_admin_email_done").style.display = "block";

                            (<any>this.wiz.getElementById("set_admin_pwd_wait")).setAttribute("active");
                            this.wiz.getElementById("set_admin_pwd_wait").style.display = "block";
                            this.wiz.getElementById("save_apply_config_done").style.display = "none";

                            setTimeout(() => {
                                let rqst = new SetRootPasswordRequest()
                                rqst.setNewpassword(this.admin_pwd)
                                rqst.setOldpassword("adminadmin")

                                Model.globular.adminService.setRootPassword(rqst, { domain: Model.domain, application: Model.application }).then(() => {

                                    (<any>this.wiz.getElementById("set_admin_pwd_wait")).removeAttribute("active");
                                    this.wiz.getElementById("set_admin_pwd_wait").style.display = "none";
                                    this.wiz.getElementById("set_admin_pwd_done").style.display = "block";

                                    (<any>this.wiz.getElementById("save_apply_config_wait")).setAttribute("active");
                                    this.wiz.getElementById("save_apply_config_wait").style.display = "block";
                                    this.wiz.getElementById("save_apply_config_done").style.display = "none";

                                    // Now I will logged admin
                                    let rqst = new AuthenticateRqst
                                    rqst.setName(this.new_email)
                                    rqst.setPassword(this.admin_pwd)

                                    Model.globular.resourceService.authenticate(rqst, { domain: Model.domain, application: Model.application }).then(
                                        (rsp: AuthenticateRsp) => {
                                            let token = rsp.getToken();
                                            let rqst = new GetConfigRequest
                                            Model.globular.adminService.getFullConfig(rqst, { token: token, domain: Model.domain, application: Model.application })
                                                .then((rsp: GetConfigResponse) => {
                                                    
                                                    let config = rsp.getResult().toJavaScript();

                                                    config.Protocol = "http"
                                                    let https = <any>this.wiz.getElementById("https")
                                                    if (https.getAttribute("checked") != undefined) {
                                                        config.Protocol = "https"
                                                    }

                                                    let domain_ = (<any>this.wiz.getElementById("domain_name_input")).inputElement.value;
                                                    if (domain_.length > 0) {
                                                        if (this.domains == undefined) {
                                                            this.domains = []
                                                        }
                                                        if (this.domains.indexOf(domain_) == -1) {
                                                            this.domains.push(domain_)
                                                        }
                                                    }

                                                    // get the list of domains from the interface.
                                                    if (this.domains != undefined) {
                                                        config.Domain = this.domains[0]
                                                        config.AlternateDomains = this.domains
                                                    }

                                                    if (this.dnsUpdateIpInfos != undefined) {
                                                        config.DnsUpdateIpInfos = this.dnsUpdateIpInfos
                                                    }

                                                    // Now the ports.

                                                    // The range.
                                                    config.PortsRange = (<any>this.wiz.getElementById("start_port_range_input")).inputElement.value + "-" + (<any>this.wiz.getElementById("end_port_range_input")).inputElement.value;

                                                    // The http.
                                                    config.PortHttp = parseInt((<any>this.wiz.getElementById("http_port_input")).inputElement.value);
                                                    config.PortHttps = parseInt((<any>this.wiz.getElementById("https_port_input")).inputElement.value);

                                                    // The server name
                                                    config.Name = (<any>this.wiz.getElementById("server_name_input")).inputElement.value;

                                                    // The certificate values
                                                    config.Organization = (<any>this.wiz.getElementById("organization_input")).inputElement.value;
                                                    config.City = (<any>this.wiz.getElementById("city_input")).inputElement.value;
                                                    config.State = (<any>this.wiz.getElementById("state_input")).inputElement.value;
                                                    config.Country = (<any>this.wiz.getElementById("country_input")).inputElement.value;

                                                    (<any>this.wiz.getElementById("save_apply_config_wait")).removeAttribute("active");
                                                    this.wiz.getElementById("save_apply_config_wait").style.display = "none";
                                                    this.wiz.getElementById("save_apply_config_done").style.display = "block";

                                                    (<any>this.wiz.getElementById("wait_server_restart_wait")).setAttribute("active");
                                                    this.wiz.getElementById("wait_server_restart_wait").style.display = "block";
                                                    this.wiz.getElementById("wait_server_restart_done").style.display = "none";


                                                    let rqst = new SaveConfigRequest
                                                    rqst.setConfig(JSON.stringify(config));
                                                    Model.globular.adminService.saveConfig(rqst, { token: token, domain: Model.domain, application: Model.application })
                                                        .then(() => {
                                                            let url = config.Protocol + "://" + config.Domain
                                                            setInterval(() => {
                                                                var oReq = new XMLHttpRequest();
                                                                oReq.onload = (e) => {

                                                                    if (oReq.readyState === 4) {
                                                                        if (oReq.status === 200) {
                                                                            (<any>this.wiz.getElementById("wait_server_restart_wait")).removeAttribute("active");
                                                                            this.wiz.getElementById("wait_server_restart_wait").style.display = "none";
                                                                            this.wiz.getElementById("wait_server_restart_done").style.display = "block";
                                                                            setTimeout(()=>{
                                                                                // Redirect to the new address.
                                                                                window.location.replace(url);
                                                                            }, 1000);
                                                                        } else {
                                                                            console.log("Error", oReq.statusText);
                                                                        }
                                                                    }
                                                                }
                                                                oReq.open("GET", url);
                                                                oReq.responseType = "arraybuffer";
                                                                oReq.send();
                                                            }, 2000);
                                                        }).catch((err: any) => {

                                                        })
                                                })
                                        })
                                })

                            }, 2000)
                        }, 2000)

                        // Now
                    }).catch((err: any) => {
                        console.log(err)
                    })
            }, 2000)

        }
    }

}