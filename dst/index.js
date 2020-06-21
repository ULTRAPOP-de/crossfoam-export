"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cfData = require("@crossfoam/data");
var utils_1 = require("@crossfoam/utils");
var exportFormats = [
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
exports.exportFormats = exportFormats;
var defs = [
    { id: 0, label: "id", type: "integer" },
    { id: 1, label: "handle", type: "string" },
    { id: 2, label: "followers_count", type: "integer" },
    { id: 3, label: "friends_count", type: "integer" },
    { id: 4, label: "isProxy", type: "boolean" },
];
var csvEncode = function (str) {
    if (typeof str === "string" && str.indexOf(",")) {
        return '"' + str + '"';
    }
    return str;
};
var exportNetwork = function (service, centralNode, nUuid, format) {
    return cfData.get("s--" + service + "--a--" + centralNode + "-" + nUuid + "--nw", { edges: [], nodes: [] })
        .then(function (data) {
        var formatSupported = false;
        exportFormats.forEach(function (exportFormat) {
            if (exportFormat.id === format) {
                formatSupported = true;
            }
        });
        if (!formatSupported) {
            // tslint:disable:no-console
            console.warn("The requested format is not supported. Default export is JSON (single file).");
            // tslint:enable:no-console
        }
        var exportFiles = [];
        switch (format) {
            case "GEXF":
                var date = new Date();
                // TODO: Use date formatter function
                var gexfString_1 = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n        <gexf xmlns=\"http://www.gexf.net/1.2draft\" version=\"1.2\">\n          <meta lastmodifieddate=\"" + date.getFullYear() + "-" + (((date.getMonth() < 9) ? "0" : "") + (date.getMonth() + 1)) + "-" + date.getDate() + "\">\n            <creator>Crossfoam</creator>\n            <description>This network was retrieved from " + service + "             and describes the network surrounding the user " + centralNode + ".</description>\n          </meta>\n          <graph mode=\"static\" defaultedgetype=\"directed\">\n            <nodes>\n";
                data.nodes.forEach(function (node) {
                    gexfString_1 += "      <node id=\"" + node[0] + "\"";
                    defs.forEach(function (def) {
                        if (def.label !== "id") {
                            gexfString_1 += " " + def.label + "=\"" + node[def.id] + "\"";
                        }
                    });
                    gexfString_1 += " />\n";
                });
                gexfString_1 += "    </nodes>\n            <edges>\n";
                data.edges.forEach(function (edge, edgeId) {
                    xmlString_1 += "      <edge id=\"" + edgeId + "\" source=\"" + edge[0] + "\"             target=\"" + edge[1] + "\" weight=\"" + edge[2] + "\" />\n";
                });
                gexfString_1 += "    </edges>\n          </graph>\n        </gexf>";
                exportFiles.push({
                    fileData: gexfString_1,
                    fileName: service + "--" + centralNode + "--gexf.xml",
                    fileType: "text/xml; charset=\"utf-8\"",
                });
                break;
            case "GDF":
                var gdfString_1 = "nodedef>name VARCHAR,label VARCHAR,class VARCHAR, visible BOOLEAN,labelvisible BOOLEAN";
                defs.forEach(function (def) {
                    if (def.label !== "id") {
                        gdfString_1 += "," + def.label + " VARCHAR";
                    }
                });
                gdfString_1 += "\n";
                data.nodes.forEach(function (node) {
                    gdfString_1 += "n" + node[0] + ",'" + node[1] + "',defaultClass,true,true";
                    defs.forEach(function (def) {
                        if (def.label !== "id") {
                            gdfString_1 += ",'" + node[def.id] + "'";
                        }
                    });
                    gdfString_1 += "\n";
                });
                gdfString_1 += "edgedef>node1 VARCHAR,node2 VARCHAR,weight DOUBLE,directed BOOLEAN\n";
                data.edges.forEach(function (edge, edgeId) {
                    gdfString_1 += "n" + edge[0] + ",n" + edge[1] + "," + edge[2] + ",false\n";
                });
                exportFiles.push({
                    fileData: gdfString_1,
                    fileName: service + "--" + centralNode + ".gdf",
                    fileType: "text/plain; charset=\"utf-8\"",
                });
                break;
            case "GML":
                var gmlString_1 = "graph\n[\n";
                data.nodes.forEach(function (node) {
                    gmlString_1 += "  node\n  [\n            id " + node[0] + "\n            label \"" + node[1] + "\"\n";
                    defs.forEach(function (def) {
                        if (def.id > 1) {
                            gmlString_1 += "    " + def.label + " \"" + node[def.id] + "\"\n";
                        }
                    });
                    gmlString_1 += "  ]\n";
                });
                data.edges.forEach(function (edge) {
                    gmlString_1 += "  edge\n    [\n    source " + edge[0] + "\n            target " + edge[1] + "\n    weight " + edge[2] + "\n";
                });
                exportFiles.push({
                    fileData: gmlString_1,
                    fileName: service + "--" + centralNode + ".gml",
                    fileType: "text/plain; charset=\"utf-8\"",
                });
                break;
            case "GraphML":
                var xmlString_1 = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n        <graphml xmlns=\"http://graphml.graphdrawing.org/xmlns\"         xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"         xsi:schemaLocation=\"http://graphml.graphdrawing.org/xmlns         http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd\">\n";
                defs.forEach(function (def) {
                    if (def.label !== "id") {
                        xmlString_1 += "        <key id=\"d" + def.id + "\" for=\"node\"               attr.name=\"" + def.label + "\" attr.type=\"" + def.type + "\" />\n";
                    }
                });
                xmlString_1 += "  <key id=\"d1\" for=\"edge\" attr.name=\"weight\" attr.type=\"double\"/>\n          <graph id=\"G\" edgedefault=\"undirected\">\n";
                data.nodes.forEach(function (node) {
                    xmlString_1 += "    <node id=\"" + node[0] + "\">";
                    defs.forEach(function (def) {
                        if (def.label !== "id") {
                            xmlString_1 += "      <data key=\"" + def.id + "\">" + node[def.id] + "</data>\n";
                        }
                    });
                    xmlString_1 += "</node>\n";
                });
                data.edges.forEach(function (edge, edgeId) {
                    xmlString_1 += "      <edge id=\"" + edgeId + "\" source=\"" + edge[0] + "\" target=\"" + edge[1] + "\">\n              <data key=\"d1\">" + edge[2] + "</data>\n";
                });
                xmlString_1 += "  </graph>\n        </graphml>";
                exportFiles.push({
                    fileData: xmlString_1,
                    fileName: service + "--" + centralNode + "--gexf.xml",
                    fileType: "text/xml; charset=\"utf-8\"",
                });
                break;
            case "PajekNet":
                var pajekString_1 = "*Vertices " + data.nodes.length + "\n";
                data.nodes.forEach(function (node) {
                    pajekString_1 += node[0] + " \"" + node[1] + "\"\n";
                });
                pajekString_1 += "*arcs\n";
                data.edges.forEach(function (edge) {
                    pajekString_1 += edge[0] + " " + edge[1] + " " + edge[2] + "\n";
                });
                exportFiles.push({
                    fileData: pajekString_1,
                    fileName: service + "--" + centralNode + "--gexf.xml",
                    fileType: "text/plain; charset=\"utf-8\"",
                });
                break;
            case "Dot":
                var dotString_1 = "graph " + service + "--" + centralNode + "{\n";
                data.nodes.forEach(function (node) {
                    dotString_1 += node[0] + " [";
                    defs.forEach(function (def) {
                        if (def.label !== "id") {
                            dotString_1 += " " + def.label + "=\"" + node[def.id] + "\"";
                        }
                    });
                    dotString_1 += "]\n";
                });
                data.edges.forEach(function (edge) {
                    dotString_1 += edge[0] + " > " + edge[1] + " [weight=\"" + edge[2] + "\"]\n";
                });
                dotString_1 += "}";
                exportFiles.push({
                    fileData: dotString_1,
                    fileName: service + "--" + centralNode + "--gexf.xml",
                    fileType: "text/plain; charset=\"utf-8\"",
                });
                break;
            case "TLP":
                var tlpString_1 = "(tlp \"2.0\"\n(nodes";
                data.nodes.forEach(function (node) {
                    tlpString_1 += " " + node[0];
                });
                tlpString_1 += ")\n";
                data.edges.forEach(function (edge) {
                    tlpString_1 += "(edge " + edge[0] + " " + edge[1] + " " + edge[2] + ")\n";
                });
                tlpString_1 += ")";
                exportFiles.push({
                    fileData: tlpString_1,
                    fileName: service + "--" + centralNode + "--gexf.xml",
                    fileType: "text/plain; charset=\"utf-8\"",
                });
                break;
            case "Netdraw":
                var netString_1 = "*node data\nID";
                defs.forEach(function (def) {
                    if (def.label !== "id") {
                        netString_1 += " " + def.label;
                    }
                });
                netString_1 += "\n";
                data.nodes.forEach(function (node) {
                    netString_1 += "" + node[0];
                    defs.forEach(function (def) {
                        if (def.label !== "id") {
                            netString_1 += " " + node[def.id];
                        }
                    });
                    netString_1 += "\n";
                });
                netString_1 += "*tie data\nfrom to  strength\n";
                data.edges.forEach(function (edge) {
                    netString_1 += edge[0] + " " + edge[1] + " " + edge[2] + "\n";
                });
                exportFiles.push({
                    fileData: netString_1,
                    fileName: service + "--" + centralNode + "--gexf.xml",
                    fileType: "text/plain; charset=\"utf-8\"",
                });
                break;
            case "CSV":
                var csvNodeString_1 = "";
                defs.forEach(function (def, di) {
                    csvNodeString_1 += "" + ((di > 0) ? "," : "") + def.label;
                });
                data.nodes.forEach(function (node) {
                    csvNodeString_1 += "\n";
                    defs.forEach(function (def, di) {
                        csvNodeString_1 += "" + ((di > 0) ? "," : "") + csvEncode(node[def.id]);
                    });
                });
                exportFiles.push({
                    fileData: csvNodeString_1,
                    fileName: service + "--" + centralNode + "--nodes.csv",
                    fileType: "text/comma-separated-values; charset=\"utf-8\"",
                });
                var csvEdgeString_1 = "source,target,weight";
                data.edges.forEach(function (edge) {
                    csvEdgeString_1 += "\n" + edge[0] + "," + edge[1] + "," + edge[2];
                });
                exportFiles.push({
                    fileData: csvEdgeString_1,
                    fileName: service + "--" + centralNode + "--edges.csv",
                    fileType: "text/comma-separated-values; charset=\"utf-8\"",
                });
                break;
            case "JSON2":
                exportFiles.push({
                    fileData: JSON.stringify(data.nodes.map(function (node) {
                        var obj = {};
                        defs.forEach(function (def) {
                            obj[def.label] = node[def.id];
                        });
                        return obj;
                    })),
                    fileName: service + "--" + centralNode + "--nodes.json",
                    fileType: "application/json; charset=\"utf-8\"",
                });
                exportFiles.push({
                    fileData: JSON.stringify(data.edges.map(function (node) {
                        return {
                            source: node[0],
                            target: node[1],
                            weight: node[2],
                        };
                    })),
                    fileName: service + "--" + centralNode + "--edges.json",
                    fileType: "application/json; charset=\"utf-8\"",
                });
                break;
            default:
                // JSON (one file)
                exportFiles.push({
                    fileData: JSON.stringify({
                        edges: data.edges.map(function (node) {
                            return {
                                source: node[0],
                                target: node[1],
                                weight: node[2],
                            };
                        }),
                        nodes: data.nodes.map(function (node) {
                            var obj = {};
                            defs.forEach(function (def) {
                                obj[def.label] = node[def.id];
                            });
                            return obj;
                        }),
                    }),
                    fileName: service + "--" + centralNode + ".json",
                    fileType: "application/json; charset=\"utf-8\"",
                });
                break;
        }
        return Promise.all(exportFiles.map(function (file) {
            return utils_1.downloadFile(file.fileData, file.fileType, file.fileName);
        }));
    });
};
exports.exportNetwork = exportNetwork;
// https://github.com/zenbox/experiences/blob/master/assets/data/miserables.json
// https://gephi.org/users/supported-graph-formats/
//# sourceMappingURL=index.js.map