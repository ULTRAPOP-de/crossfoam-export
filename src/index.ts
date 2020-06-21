import * as cfData from "@crossfoam/data";
import { downloadFile } from "@crossfoam/utils";

const exportFormats = [
  {
    description: browser.i18n.getMessage("exportGexfDesc"),
    icon: "xml",
    id: "GEXF",
    label: "GEXF Format",
  },
  {
    description: browser.i18n.getMessage("exportGdfDesc"),
    icon: "tabular",
    id: "GDF",
    label: "GDF Format",
  },
  {
    description: browser.i18n.getMessage("exportGmlDesc"),
    icon: "text",
    id: "GML",
    label: "GML Format",
  },
  {
    description: browser.i18n.getMessage("exportGraphMlDesc"),
    icon: "xml",
    id: "GraphML",
    label: "GraphML Format",
  },
  {
    description: browser.i18n.getMessage("exportPajekNetDesc"),
    icon: "text",
    id: "PajekNet",
    label: "Pajek Net",
  },
  {
    description: browser.i18n.getMessage("exportDotDesc"),
    icon: "text",
    id: "Dot",
    label: "GraphViz DOT Format",
  },
  {
    description: browser.i18n.getMessage("exportTlpDesc"),
    icon: "text",
    id: "TLP",
    label: "TLP",
  },
  {
    description: browser.i18n.getMessage("exportNetdrawDesc"),
    icon: "text",
    id: "Netdraw",
    label: "Netdraw VNA",
  },
  {
    description: browser.i18n.getMessage("exportCsvDesc"),
    icon: "tabular",
    id: "CSV",
    label: browser.i18n.getMessage("exportCsvLabel"),
  },
  {
    description: browser.i18n.getMessage("exportJson2Desc"),
    icon: "json",
    id: "JSON2",
    label: browser.i18n.getMessage("exportJson2Label"),
  },
  {
    description: browser.i18n.getMessage("exportJsonDesc"),
    icon: "json",
    id: "JSON",
    label: "JSON",
  },
];

const defs = [
  {id: 0, label: "id", type: "integer"},
  {id: 1, label: "handle", type: "string"},
  {id: 2, label: "followers_count", type: "integer"},
  {id: 3, label: "friends_count", type: "integer"},
  {id: 4, label: "isProxy", type: "boolean"},
];

const csvEncode = (str: string): string => {
  if (typeof str === "string" && str.indexOf(",")) {
    return '"' + str + '"';
  }
  return str;
};

const exportNetwork = (service: string, centralNode: string,
                       nUuid: string, format: string): Promise<any> => {

  return cfData.get(`s--${service}--a--${centralNode}-${nUuid}--nw`, {edges: [], nodes: []})
    .then((data) => {

      let formatSupported = false;
      exportFormats.forEach((exportFormat) => {
        if (exportFormat.id === format) {
          formatSupported = true;
        }
      });

      if (!formatSupported) {
        // tslint:disable:no-console
        console.warn("The requested format is not supported. Default export is JSON (single file).");
        // tslint:enable:no-console
      }

      const exportFiles = [];

      switch (format) {
        case "GEXF":
          const date = new Date();

          // TODO: Use date formatter function

          let gexfString = `<?xml version="1.0" encoding="UTF-8"?>\n\
        <gexf xmlns="http://www.gexf.net/1.2draft" version="1.2">\n\
          <meta lastmodifieddate="${date.getFullYear()}-${
            ((date.getMonth() < 9) ? "0" : "") + (date.getMonth() + 1)
          }-${date.getDate()}">\n\
            <creator>Crossfoam</creator>\n\
            <description>This network was retrieved from ${service} \
            and describes the network surrounding the user ${centralNode}.</description>\n\
          </meta>\n\
          <graph mode="static" defaultedgetype="directed">\n\
            <nodes>\n`;

          data.nodes.forEach((node) => {
            gexfString += `      <node id="${node[0]}"`;
            defs.forEach((def) => {
              if (def.label !== "id") {
                gexfString += ` ${def.label}="${node[def.id]}"`;
              }
            });
            gexfString += ` />\n`;
          });

          gexfString += `    </nodes>\n\
            <edges>\n`;

          data.edges.forEach((edge, edgeId) => {
            xmlString += `      <edge id="${edgeId}" source="${edge[0]}" \
            target="${edge[1]}" weight="${edge[2]}" />\n`;
          });

          gexfString += `    </edges>\n\
          </graph>\n\
        </gexf>`;

          exportFiles.push({
            fileData: gexfString,
            fileName: `${service}--${centralNode}--gexf.xml`,
            fileType: `text/xml; charset="utf-8"`,
          });

          break;
        case "GDF":
          let gdfString = `nodedef>name VARCHAR,label VARCHAR,class VARCHAR, visible BOOLEAN,labelvisible BOOLEAN`;

          defs.forEach((def) => {
            if (def.label !== "id") {
              gdfString += `,${def.label} VARCHAR`;
            }
          });

          gdfString += "\n";

          data.nodes.forEach((node) => {
            gdfString += `n${node[0]},'${node[1]}',defaultClass,true,true`;
            defs.forEach((def) => {
              if (def.label !== "id") {
                gdfString += `,'${node[def.id]}'`;
              }
            });
            gdfString += "\n";
          });

          gdfString += `edgedef>node1 VARCHAR,node2 VARCHAR,weight DOUBLE,directed BOOLEAN\n`;

          data.edges.forEach((edge, edgeId) => {
            gdfString += `n${edge[0]},n${edge[1]},${edge[2]},false\n`;
          });

          exportFiles.push({
            fileData: gdfString,
            fileName: `${service}--${centralNode}.gdf`,
            fileType: `text/plain; charset="utf-8"`,
          });
          break;
        case "GML":
          let gmlString = `graph\n\[\n`;

          data.nodes.forEach((node) => {
            gmlString += `  node\n\  [\n\
            id ${node[0]}\n\
            label "${node[1]}"\n`;

            defs.forEach((def) => {
              if (def.id > 1) {
                gmlString += `    ${def.label} "${node[def.id]}"\n`;
              }
            });

            gmlString += `  ]\n`;
          });

          data.edges.forEach((edge) => {
            gmlString += `  edge\n    [\n    source ${edge[0]}\n\
            target ${edge[1]}\n    weight ${edge[2]}\n`;
          });

          exportFiles.push({
            fileData: gmlString,
            fileName: `${service}--${centralNode}.gml`,
            fileType: `text/plain; charset="utf-8"`,
          });
          break;
        case "GraphML":
          let xmlString = `<?xml version="1.0" encoding="UTF-8"?>\n\
        <graphml xmlns="http://graphml.graphdrawing.org/xmlns" \
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" \
        xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns \
        http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">\n`;

          defs.forEach((def) => {
            if (def.label !== "id") {
              xmlString += `        <key id="d${def.id}" for="node" \
              attr.name="${def.label}" attr.type="${def.type}" />\n`;
            }
          });

          xmlString += `  <key id="d1" for="edge" attr.name="weight" attr.type="double"/>\n\
          <graph id="G" edgedefault="undirected">\n`;

          data.nodes.forEach((node) => {
            xmlString += `    <node id="${node[0]}">`;
            defs.forEach((def) => {
              if (def.label !== "id") {
                xmlString += `      <data key="${def.id}">${node[def.id]}</data>\n`;
              }
            });
            xmlString += `</node>\n`;
          });

          data.edges.forEach((edge, edgeId) => {
            xmlString += `      <edge id="${edgeId}" source="${edge[0]}" target="${edge[1]}">\n\
              <data key="d1">${edge[2]}</data>\n`;
          });

          xmlString += `  </graph>\n\
        </graphml>`;

          exportFiles.push({
            fileData: xmlString,
            fileName: `${service}--${centralNode}--gexf.xml`,
            fileType: `text/xml; charset="utf-8"`,
          });
          break;
        case "PajekNet":
          let pajekString = `*Vertices ${data.nodes.length}\n`;

          data.nodes.forEach((node) => {
            pajekString += `${node[0]} "${node[1]}"\n`;
          });

          pajekString += `*arcs\n`;

          data.edges.forEach((edge) => {
            pajekString += `${edge[0]} ${edge[1]} ${edge[2]}\n`;
          });

          exportFiles.push({
            fileData: pajekString,
            fileName: `${service}--${centralNode}--gexf.xml`,
            fileType: `text/plain; charset="utf-8"`,
          });
          break;
        case "Dot":
          let dotString = `graph ${service}--${centralNode}{\n`;

          data.nodes.forEach((node) => {
            dotString += `${node[0]} [`;
            defs.forEach((def) => {
              if (def.label !== "id") {
                dotString += ` ${def.label}="${node[def.id]}"`;
              }
            });
            dotString += `]\n`;
          });

          data.edges.forEach((edge) => {
            dotString += `${edge[0]} > ${edge[1]} [weight="${edge[2]}"]\n`;
          });

          dotString += `}`;

          exportFiles.push({
            fileData: dotString,
            fileName: `${service}--${centralNode}--gexf.xml`,
            fileType: `text/plain; charset="utf-8"`,
          });

          break;
        case "TLP":
          let tlpString = `(tlp "2.0"\n(nodes`;

          data.nodes.forEach((node) => {
            tlpString += ` ${node[0]}`;
          });

          tlpString += `)\n`;

          data.edges.forEach((edge) => {
            tlpString += `(edge ${edge[0]} ${edge[1]} ${edge[2]})\n`;
          });

          tlpString += `)`;

          exportFiles.push({
            fileData: tlpString,
            fileName: `${service}--${centralNode}--gexf.xml`,
            fileType: `text/plain; charset="utf-8"`,
          });
          break;
        case "Netdraw":
          let netString = `*node data\nID`;

          defs.forEach((def) => {
            if (def.label !== "id") {
              netString += ` ${def.label}`;
            }
          });

          netString += `\n`;

          data.nodes.forEach((node) => {
            netString += `${node[0]}`;

            defs.forEach((def) => {
              if (def.label !== "id") {
                netString += ` ${node[def.id]}`;
              }
            });

            netString += `\n`;
          });

          netString += `*tie data\nfrom to  strength\n`;

          data.edges.forEach((edge) => {
            netString += `${edge[0]} ${edge[1]} ${edge[2]}\n`;
          });

          exportFiles.push({
            fileData: netString,
            fileName: `${service}--${centralNode}--gexf.xml`,
            fileType: `text/plain; charset="utf-8"`,
          });
          break;
        case "CSV":
          let csvNodeString = ``;

          defs.forEach((def, di) => {
            csvNodeString += `${(di > 0) ? "," : ""}${def.label}`;
          });

          data.nodes.forEach((node) => {
            csvNodeString += `\n`;
            defs.forEach((def, di) => {
              csvNodeString += `${(di > 0) ? "," : ""}${csvEncode(node[def.id])}`;
            });
          });

          exportFiles.push({
            fileData: csvNodeString,
            fileName: `${service}--${centralNode}--nodes.csv`,
            fileType: `text/comma-separated-values; charset="utf-8"`,
          });

          let csvEdgeString = `source,target,weight`;

          data.edges.forEach((edge) => {
            csvEdgeString += `\n${edge[0]},${edge[1]},${edge[2]}`;
          });

          exportFiles.push({
            fileData: csvEdgeString,
            fileName: `${service}--${centralNode}--edges.csv`,
            fileType: `text/comma-separated-values; charset="utf-8"`,
          });
          break;
        case "JSON2":
          exportFiles.push({
            fileData: JSON.stringify(data.nodes.map((node) => {
              const obj = {};
              defs.forEach((def) => {
                obj[def.label] = node[def.id];
              });
              return obj;
            })),
            fileName: `${service}--${centralNode}--nodes.json`,
            fileType: `application/json; charset="utf-8"`,
          });

          exportFiles.push({
            fileData: JSON.stringify(data.edges.map((node) => {
              return {
                source: node[0],
                target: node[1],
                weight: node[2],
              };
            })),
            fileName: `${service}--${centralNode}--edges.json`,
            fileType: `application/json; charset="utf-8"`,
          });
          break;
        default:
          // JSON (one file)
          exportFiles.push({
            fileData: JSON.stringify({
              edges: data.edges.map((node) => {
                return {
                  source: node[0],
                  target: node[1],
                  weight: node[2],
                };
              }),
              nodes: data.nodes.map((node) => {
                const obj = {};
                defs.forEach((def) => {
                  obj[def.label] = node[def.id];
                });
                return obj;
              }),
            }),
            fileName: `${service}--${centralNode}.json`,
            fileType: `application/json; charset="utf-8"`,
          });
          break;
      }

      return Promise.all(exportFiles.map((file) => {
        return downloadFile(file.fileData, file.fileType, file.fileName);
      }));

    });

};

export { exportFormats, exportNetwork };

// https://github.com/zenbox/experiences/blob/master/assets/data/miserables.json
// https://gephi.org/users/supported-graph-formats/
