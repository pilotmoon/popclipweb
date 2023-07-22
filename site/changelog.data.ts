import axios from "axios";

function buildNotes(data: any[]) {
  let html = "";
  for (const item of data) {
    const formattedDate = new Date(item.date).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });

    console.log(formattedDate); // outputs something li

    html +=
      `<h2>${item.versionString}&ensp;<span class="diminish">(${formattedDate})</span></h2>      
      ${item.description}`;
  }
  return html;
}

export default {
  async load() {
    // use respective CMS client library if needed
    const { data } = await axios.get(
      "https://pilotmoon.com/popclip/releases.json",
    );
    const { data: dataBeta } = await axios.get(
      "https://pilotmoon.com/popclip/releases-beta.json",
    );
    return {
      html: buildNotes(data),
      htmlBeta: buildNotes(dataBeta),
    };
  },
};
