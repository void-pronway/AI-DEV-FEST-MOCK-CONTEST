import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { validateBuilding } from "./utils/validateBuilding";
import BuildingMap from "./components/BuildingMap";
import { findBestRoute } from "./utils/findBestRoute";

const OWNER_NAME = "Pronway Mitra";

const translations = {
  en: {
    subtitle: "Interactive Evacuation Route Simulator",
    instruction:
      "Import a building file, choose your starting point and find the safest available exit.",
    importBuilding: "Import Building",
    startLocation: "Start location",
    selectLocation: "Select location",
    routeStatus: "Route status",
    waiting: "Waiting for a starting location",
    noBuilding: "Import building.json to begin",
    loaded: "Building loaded successfully",
    invalidFile: "Invalid building file",
    jsonError: "The selected file is not valid JSON.",
    manageHazards: "Manage Hazards",
    reset: "Reset",
    project: "AI DevFest Mock Contest",
    disclaimer: "Educational evacuation simulation only.",
    copyright: "All rights reserved.",
    safeRoute: "Safe route found",
    totalCost: "Total cost",
    exit: "Exit",
    noRoute: "No route available",
    blockedStart: "Starting location blocked",
  },

  bn: {
    subtitle: "ইন্টার‌্যাক্টিভ জরুরি নির্গমন পথ সিমুলেটর",
    instruction:
      "ভবনের ফাইল ইমপোর্ট করুন, শুরুর স্থান নির্বাচন করুন এবং নিরাপদ নির্গমন পথ খুঁজুন।",
    importBuilding: "ভবন ইমপোর্ট করুন",
    startLocation: "শুরুর স্থান",
    selectLocation: "স্থান নির্বাচন করুন",
    routeStatus: "পথের অবস্থা",
    waiting: "শুরুর স্থান নির্বাচনের অপেক্ষায়",
    noBuilding: "শুরু করতে building.json ইমপোর্ট করুন",
    loaded: "ভবনের তথ্য সফলভাবে লোড হয়েছে",
    invalidFile: "ভবনের ফাইলটি সঠিক নয়",
    jsonError: "নির্বাচিত ফাইলটি সঠিক JSON নয়।",
    manageHazards: "ঝুঁকি নিয়ন্ত্রণ",
    reset: "রিসেট",
    project: "AI DevFest মক কনটেস্ট",
    disclaimer: "শুধুমাত্র শিক্ষামূলক ইভাকুয়েশন সিমুলেশন।",
    copyright: "সর্বস্বত্ব সংরক্ষিত।",
    safeRoute: "নিরাপদ পথ পাওয়া গেছে",
    totalCost: "মোট খরচ",
    exit: "নির্গমন",
    noRoute: "কোনো পথ পাওয়া যায়নি",
    blockedStart: "শুরুর স্থানটি বন্ধ",
  },
};

function App() {
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState("dark");

  const [building, setBuilding] = useState(null);
  const [fileStatus, setFileStatus] = useState(null);
  const [fileErrors, setFileErrors] = useState([]);

  const [showHazards, setShowHazards] = useState(false);

  const [selectedStart, setSelectedStart] = useState("");

  const [hazardState, setHazardState] = useState({
    blocked_nodes: [],
    blocked_edges: [],
    closed_exits: [],
  });

  const fileInputRef = useRef(null);

  const t = translations[language];

  const routeResult = useMemo(() => {
    return findBestRoute(building, selectedStart, hazardState);
  }, [building, selectedStart, hazardState]);

  useEffect(() => {
    document.documentElement.lang = language === "bn" ? "bn" : "en";
  }, [language]);

  function handleFileImport(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);

        const result = validateBuilding(parsed);

        if (!result.valid) {
          setBuilding(null);
          setSelectedStart("");
          setFileStatus("invalid");
          setFileErrors(result.errors);
          return;
        }

        setBuilding(parsed);

        setSelectedStart("");

        setHazardState({
          blocked_nodes: [...parsed.initial_state.blocked_nodes],
          blocked_edges: [...parsed.initial_state.blocked_edges],
          closed_exits: [...parsed.initial_state.closed_exits],
        });

        setShowHazards(false);
        setFileStatus("success");
        setFileErrors([]);
      } catch {
        setBuilding(null);
        setSelectedStart("");
        setFileStatus("json-error");
        setFileErrors([]);
      }
    };

    reader.readAsText(file);

    event.target.value = "";
  }

  function toggleBlockedNode(nodeId) {
    setHazardState((current) => {
      const alreadyBlocked = current.blocked_nodes.includes(nodeId);

      return {
        ...current,
        blocked_nodes: alreadyBlocked
          ? current.blocked_nodes.filter((id) => id !== nodeId)
          : [...current.blocked_nodes, nodeId],
      };
    });
  }

  function toggleBlockedEdge(edgeId) {
    setHazardState((current) => {
      const alreadyBlocked = current.blocked_edges.includes(edgeId);

      return {
        ...current,
        blocked_edges: alreadyBlocked
          ? current.blocked_edges.filter((id) => id !== edgeId)
          : [...current.blocked_edges, edgeId],
      };
    });
  }

  function toggleClosedExit(exitId) {
    setHazardState((current) => {
      const alreadyClosed = current.closed_exits.includes(exitId);

      return {
        ...current,
        closed_exits: alreadyClosed
          ? current.closed_exits.filter((id) => id !== exitId)
          : [...current.closed_exits, exitId],
      };
    });
  }

  function handleReset() {
    if (!building) return;

    setHazardState({
      blocked_nodes: [...building.initial_state.blocked_nodes],
      blocked_edges: [...building.initial_state.blocked_edges],
      closed_exits: [...building.initial_state.closed_exits],
    });

    setSelectedStart("");
    setShowHazards(false);
  }

  const selectableNodes =
    building?.nodes.filter(
      (node) => node.type === "room" || node.type === "junction",
    ) ?? [];

  return (
    <div className={`app ${theme}`}>
      <header className="header">
        <div className="brand">
          <div className="brand-title">
            <span className="brand-name bangla-name">নিরাপদ পথ</span>
            <span className="brand-name english-name">SMART ESCAPE</span>
          </div>

          <p>{t.subtitle}</p>
        </div>

        <div className="header-actions">
          <button
            className="control-button language-button"
            onClick={() =>
              setLanguage((current) => (current === "en" ? "bn" : "en"))
            }
          >
            {language === "en" ? "বাংলা" : "EN"}
          </button>

          <button
            className="control-button theme-button"
            onClick={() =>
              setTheme((current) => (current === "dark" ? "light" : "dark"))
            }
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </header>

      <main className="main-content">
        <section className="intro">
          <p>{t.instruction}</p>

          <button
            className="import-button"
            onClick={() => fileInputRef.current?.click()}
          >
            + {t.importBuilding}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileImport}
            hidden
          />

          {fileStatus === "success" && (
            <div className="file-message success-message">
              ✓ {t.loaded}: <strong>{building.building}</strong>
            </div>
          )}

          {fileStatus === "json-error" && (
            <div className="file-message error-message">⚠ {t.jsonError}</div>
          )}

          {fileStatus === "invalid" && (
            <div className="validation-box">
              <strong>⚠ {t.invalidFile}</strong>

              <ul>
                {fileErrors.map((error, index) => (
                  <li key={`${error}-${index}`}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="simulator">
          <div className="map-area">
            {building ? (
              <BuildingMap
                building={building}
                hazardState={hazardState}
                routeResult={routeResult}
                selectedStart={selectedStart}
                hazardMode={showHazards}
                onSelectStart={setSelectedStart}
                onToggleNode={toggleBlockedNode}
                onToggleEdge={toggleBlockedEdge}
                onToggleExit={toggleClosedExit}
              />
            ) : (
              <div className="map-placeholder">
                <div className="map-icon">⌘</div>
                <p>{t.noBuilding}</p>
              </div>
            )}
          </div>

          <div className="control-panel">
            <div className="control-group">
              <label>{t.startLocation}</label>

              <select
                value={selectedStart}
                disabled={!building}
                onChange={(event) => setSelectedStart(event.target.value)}
              >
                <option value="">{t.selectLocation}</option>

                {selectableNodes.map((node) => {
                  const blocked = hazardState.blocked_nodes.includes(node.id);

                  return (
                    <option key={node.id} value={node.id} disabled={blocked}>
                      {node.label} ({node.id}){blocked ? " — blocked" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className={`route-card route-${routeResult.status}`}>
              <span className="route-label">{t.routeStatus}</span>

              {!selectedStart && <strong>{t.waiting}</strong>}

              {routeResult.status === "success" && (
                <>
                  <strong className="route-success-title">
                    ✓ {t.safeRoute}
                  </strong>

                  <div className="route-path">
                    {routeResult.path.join(" → ")}
                  </div>

                  <div className="route-details">
                    <span>
                      {t.exit}: <strong>{routeResult.exitId}</strong>
                    </span>

                    <span>
                      {t.totalCost}: <strong>{routeResult.cost}</strong>
                    </span>
                  </div>
                </>
              )}

              {routeResult.status === "no-route" && (
                <strong className="route-error">⚠ {t.noRoute}</strong>
              )}

              {routeResult.status === "blocked-start" && (
                <strong className="route-error">⚠ {t.blockedStart}</strong>
              )}
            </div>

            <div className="action-buttons">
              <button
                className="primary-button"
                disabled={!building}
                onClick={() => setShowHazards((current) => !current)}
              >
                {showHazards
                  ? language === "en"
                    ? "Done Editing"
                    : "সম্পন্ন"
                  : t.manageHazards}
              </button>

              <button
                className="secondary-button"
                disabled={!building}
                onClick={handleReset}
              >
                {t.reset}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <strong>{OWNER_NAME}</strong>
          <span> · {t.project}</span>
        </div>

        <div>
          © 2026 {OWNER_NAME} · {t.copyright}
        </div>

        <small>{t.disclaimer}</small>
      </footer>
    </div>
  );
}

export default App;
