import { FilmStage } from "@/components/film/FilmStage";
import { FilmCues } from "@/components/film/FilmCues";
import { buildMetadata } from "@/lib/seo";
import "./film.css";

export const metadata = buildMetadata({
  title: "The Film · Cinematic Botanical Journey",
  description:
    "Experience the AVVVS film: from the Kerala forest canopy and Hortus Malabaricus 1678 to bell-metal compounding and centenary medicines.",
  path: "/film",
  noindex: true,
});

export default function FilmPage() {
  return (
    <div id="film-track" className="film-track scene is-live" data-scene="film">
      <FilmStage>
        <FilmCues />
      </FilmStage>
      <div id="site" tabIndex={-1} style={{ position: "absolute", bottom: 0, height: 1, width: 1, pointerEvents: "none" }} />
    </div>
  );
}
