import { FloorplanElement } from '../lib/floorplan/floorplan-element';
import { FloorplanCard } from '../lib/floorplan/floorplan-exports';
import { FloorplanConfig } from '../lib/floorplan/floorplan-config';
import { CardConfig } from '../lib/floorplan/card-config';
import { Simulator, SimulatorConfig } from '../lib/hass/simulator';
import { Utils } from '../lib/utils';

window.onload = function () {
  const projects = [
    { dir: "simple", configFile: "simple-card.yaml", statesFile: "states.yaml", },
    { dir: "simple", configFile: "simple.yaml", statesFile: "states.yaml", },
    //{ dir: "home-multi", configFile: "main.yaml", statesFile: "states.yaml", },
    //{ dir: "ian", configFile: "home.yaml", statesFile: "states.yaml", },
    //{ dir: "home", configFile: "home.yaml", statesFile: "states.yaml", },
    { dir: "ring", configFile: "ring.yaml", statesFile: "states.yaml", },
  ] as Array<FloorplanProject>;

  const container = document.querySelector(".floorplan-projects") as Element;

  projects.forEach((project) => {
    const isCard = project.configFile!.endsWith("card.yaml");

    const projectElement = document.createElement("div");
    projectElement.classList.add("floorplan-project");
    container.appendChild(projectElement);

    const projectHeading = document.createElement("h2");
    projectHeading.textContent = `${isCard ? "Card" : "Panel"} - ${project.dir!}`;
    projectHeading.style.textAlign = "center";
    projectElement.appendChild(projectHeading);

    const floorplanContainer = document.createElement("div");
    floorplanContainer.classList.add("floorplan-container");
    projectElement.appendChild(floorplanContainer);

    const floorplanElement = isCard ?
      document.createElement("floorplan-card") as FloorplanCard :
      document.createElement("floorplan-element") as FloorplanElement;
    floorplanContainer.appendChild(floorplanElement);

    const projectDemo = new FloorplanProjectDemo(floorplanElement, project);
  });
}

export class FloorplanProjectDemo {
  simulator?: Simulator;

  constructor(private floorplan: FloorplanElement, private project: FloorplanProject) {
    this.init();
  }

  async init() {
    console.log("process.env.NODE_ENV", process.env.NODE_ENV);
    console.log("process.env.EXAMPLES_DIR", process.env.EXAMPLES_DIR);

    this.floorplan._isDemo = true;; // running in demo Web page
    
    const configUrl = `${process.env.EXAMPLES_DIR}/${this.project.dir}/${this.project.configFile}`;
    let configYamlText = await Utils.fetchText(configUrl, true);
    const config = Utils.parseYaml(configYamlText) as FloorplanConfig | CardConfig;

    this.floorplan.setConfig(config);

    if (this.project.statesFile) {
      const simulatorUrl = `${process.env.EXAMPLES_DIR}/${this.project.dir}/${this.project.statesFile}`;
      let simulatorYamlText = await Utils.fetchText(simulatorUrl, true);
      const simulatorConfig = Utils.parseYaml(simulatorYamlText) as SimulatorConfig;
      this.simulator = new Simulator(simulatorConfig, this.floorplan.setHass.bind(this.floorplan));
    }
  }
}

export class FloorplanProject {
  dir?: string;
  configFile?: string;
  statesFile?: string
}