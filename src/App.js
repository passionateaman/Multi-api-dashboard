import React, { useState, useEffect } from 'react';
import { Send, Loader2, TrendingUp } from 'lucide-react';
import { useRef } from "react";

const API_ENDPOINTS = {
  api1: 'https://allan-hyperspatial-apogamically.ngrok-free.dev/chat',
  api2: 'https://osteitic-rosalina-nonmilitantly.ngrok-free.dev/api/run',  
  api3: 'https://shawnee-stodgy-melvina.ngrok-free.dev/chat'   
};

const MultiAPIQueryApp = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [vegaLoaded, setVegaLoaded] = useState(false);
  const orbRef = useRef({ x: 0, y: 0 });

useEffect(() => {
  const handleMouseMove = (e) => {
    orbRef.current = {
      x: (e.clientX / window.innerWidth - 0.5) * 40,
      y: (e.clientY / window.innerHeight - 0.5) * 40,
    };

    document.documentElement.style.setProperty(
      "--orb-x",
      `${orbRef.current.x}px`
    );
    document.documentElement.style.setProperty(
      "--orb-y",
      `${orbRef.current.y}px`
    );
  };

  window.addEventListener("mousemove", handleMouseMove);
  return () => window.removeEventListener("mousemove", handleMouseMove);
}, []);

  useEffect(() => {
    const loadVegaLibraries = async () => {
      if (window.vegaEmbed) {
        setVegaLoaded(true);
        return;
      }

      const scripts = [
        'https://cdn.jsdelivr.net/npm/vega@5',
        'https://cdn.jsdelivr.net/npm/vega-lite@5',
        'https://cdn.jsdelivr.net/npm/vega-embed@6'
      ];

      for (const src of scripts) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      setVegaLoaded(true);
    };

    loadVegaLibraries();
  }, []);

  const calculateRelevancy = async (query, answer) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-exp:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          'ngrok-skip-browser-warning': '69420'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
User Query: "${query}"

Answer Received:
${typeof answer === "object" ? JSON.stringify(answer) : answer}

Analyze how relevant this answer is to the user's query.
 Consider: - Does it directly address the question? 
           - Is the information accurate and useful? 
           - How well does it match the user's intent? 
      Respond with ONLY a number between 0-100 representing the relevancy percentage. No explanation, just the number.
                  `
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "0";

    const score = parseInt(text.match(/\d+/)?.[0] || "0");
    const finalScore = Math.min(100, Math.max(0, score));
    console.log("Relevancy calculated:", finalScore, "for query:", query);
    return finalScore;

  } catch (error) {
    console.error("Gemini relevancy error:", error);
    return 0;
  }
};

  // ========== CHANGE 2: handleSubmit mein company_name bhejo ==========
  const handleSubmit = async () => {
    if (!query.trim() || loading) return;

    setLoading(true);
    setResults(null);

    try {
      const startTime1 = performance.now();
      const startTime2 = performance.now();
      const startTime3 = performance.now();

      const settledResults = await Promise.allSettled([
        fetch(API_ENDPOINTS.api1, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '69420' },
          body: JSON.stringify({ query })
        }).then(async (r) => {
  const data = await r.json();
  if (!r.ok) {
    throw new Error(data?.detail || data?.error || "API error");
  }
  return data;
})
.then(data => ({ data, time: performance.now() - startTime1 })),

        fetch(API_ENDPOINTS.api2, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'ngrok-skip-browser-warning': '69420',
            'x-api-key': process.env.REACT_APP_API2_KEY
          },
          body: JSON.stringify({ query })
        }).then(async (r) => {
  const data = await r.json();
  if (!r.ok) {
    throw new Error(data?.detail || data?.error || "API error");
  }
  return data;
})
.then(data => ({ data, time: performance.now() - startTime2 })),

        fetch(API_ENDPOINTS.api3, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '69420' },
          body: JSON.stringify({ query })
        }).then(async (r) => {
  const data = await r.json();
  if (!r.ok) {
    throw new Error(data?.detail || data?.error || "API error");
  }
  return data;
})
.then(data => ({ data, time: performance.now() - startTime3 }))
      ]);
      // ====================================================================

      const result1 = settledResults[0].status === "fulfilled"
        ? settledResults[0].value.data
        :{ 
        output_type: "text",
        summary: settledResults[0].reason?.message || "API failed"
      };
      const time1 = settledResults[0].status === "fulfilled"
        ? settledResults[0].value.time
        : 0;


      const result2 = settledResults[1].status === "fulfilled"
        ? settledResults[1].value.data
        : { 
        output_type: "text",
        summary: settledResults[1].reason?.message || "API failed"
      };
      const time2 = settledResults[1].status === "fulfilled"
        ? settledResults[1].value.time
        :0;

      const result3 = settledResults[2].status === "fulfilled"
        ? settledResults[2].value.data
        : { 
        output_type: "text",
        summary: settledResults[2].reason?.message || "API failed"
      };
      const time3 = settledResults[2].status === "fulfilled"
        ? settledResults[2].value.time
        :0;


      const [rel1, rel2, rel3] = await Promise.all([
        calculateRelevancy(query, result1),
        calculateRelevancy(query, result2),
        calculateRelevancy(query, result3)
      ]);

      setResults({
        api1: { data: result1, relevancy: rel1, fetchTime: time1, name: 'VEGA-LITE' },
        api2: { data: result2, relevancy: rel2, fetchTime: time2, name: 'LLM BASED' },
        api3: { data: result3, relevancy: rel3, fetchTime: time3, name: 'VLM BASED' }
      });

    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const renderTable = (tableData) => {
    if (!tableData || !tableData.headers || !tableData.rows) return null;
    
    return (
      <div className="overflow-x-auto my-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-purple-500/20 to-pink-500/20">
              {tableData.headers.map((h, i) => (
                <th key={i} className="border border-purple-300/30 px-4 py-3 text-left font-semibold text-purple-100">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, i) => (
              <tr key={i} className="hover:bg-purple-500/10 transition-colors">
                {row.map((cell, j) => (
                  <td key={j} className="border border-purple-300/20 px-4 py-2 text-gray-200">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const VegaChart = ({ spec, containerId }) => {
    useEffect(() => {
      if (window.vegaEmbed && spec) {
        // ========== IMPROVED VEGA RENDERING (like Streamlit) ==========
        const enhancedSpec = {
          ...spec,
          // Remove fixed width/height for responsive design
          width: "container",
          height: 400,
          autosize: {
            type: "fit",
            contains: "padding"
          },
          // Enhance visual appearance
          config: {
            view: {
              stroke: null,
              fill: "#1e293b"
            },
            axis: {
              labelColor: "#cbd5e1",
              titleColor: "#e2e8f0",
              gridColor: "#334155",
              domainColor: "#475569"
            },
            legend: {
              labelColor: "#cbd5e1",
              titleColor: "#e2e8f0"
            },
            title: {
              color: "#f1f5f9",
              fontSize: 16
            }
          }
        };

        window.vegaEmbed(`#${containerId}`, enhancedSpec, {
          actions: {
            export: true,
            source: false,
            compiled: false,
            editor: false
          },
          theme: 'dark',
          renderer: 'canvas' // Better performance
        }).catch(err => console.error('Vega embed error:', err));
      }
    }, [spec, containerId]);

    return (
      <div className="w-full overflow-x-auto bg-slate-900/30 rounded-lg p-2">
        <div
          id={containerId}
          className="min-w-[400px] flex justify-center"
        ></div>
      </div>
    );
  };

  const renderContent = (data, apiIndex) => {
    if (!data) return <p className="text-gray-400">No content available</p>;

    // ========== BACKEND RESPONSE HANDLING ==========
    const outputType = data.output_type || 'text';
    const summary = data.summary || '';
    const vegaSpec = data.vega_spec || data.vegaSpec; // Support both formats
    
    // Handle markdown tables (from backend)
    const isMarkdownTable = outputType === 'markdown' && summary.includes('|');
    
    return (
      <div className="space-y-4">
        {/* ========== MARKDOWN TABLE (from backend) ========== */}
        {isMarkdownTable && (
          <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-400/20 overflow-x-auto">
            <pre className="text-gray-200 text-sm whitespace-pre-wrap font-mono">
              {summary}
            </pre>
          </div>
        )}

        {/* ========== GRAPH OUTPUT (vega_spec exists) ========== */}
        {vegaSpec && vegaLoaded && (
          <div className="space-y-3">
            {/* Summary Text (if exists and not markdown table) */}
            {summary && !isMarkdownTable && (
              <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-400/20">
                <h4 className="text-sm font-semibold text-purple-300 mb-2">Analysis:</h4>
                <p className="text-gray-200 leading-relaxed text-sm">{summary}</p>
              </div>
            )}
            
            {/* Vega Chart */}
            <div className="bg-slate-800/50 rounded-lg border border-purple-400/20 p-4">
              <h4 className="text-sm font-semibold text-purple-300 mb-3">Visualization:</h4>
              <VegaChart spec={vegaSpec} containerId={`vega-chart-${apiIndex}`} />
            </div>
          </div>
        )}

        {/* ========== TEXT ONLY (no graph, no markdown table) ========== */}
        {!vegaSpec && !isMarkdownTable && summary && (
          <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-400/20">
            <h4 className="text-sm font-semibold text-purple-300 mb-2">Response:</h4>
            <p className="text-gray-200 leading-relaxed text-sm whitespace-pre-wrap">{summary}</p>
          </div>
        )}

        {/* ========== LEGACY FORMAT SUPPORT (for demo responses) ========== */}
        {data.value !== undefined && (
          <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg p-6 border border-purple-400/30 text-center">
            <h4 className="text-sm font-semibold text-purple-300 mb-2">Value:</h4>
            <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {data.value}
            </p>
          </div>
        )}

        {data.table && (
          <div>
            <h4 className="text-sm font-semibold text-purple-300 mb-2">Table:</h4>
            {renderTable(data.table)}
          </div>
        )}
      </div>
    );
  };

  const APICard = ({ apiData, color, index }) => {
    const colorSchemes = {
      purple: {
        gradient: 'from-purple-600 to-purple-700',
        border: 'border-purple-500/30',
        shadow: 'shadow-purple-500/20',
        text: 'text-purple-300',
        bg: 'from-slate-800/80 to-purple-900/30',
        borderLight: 'border-purple-500/20',
        relevancyBg: 'from-purple-600/20 to-pink-600/20',
        relevancyBorder: 'border-purple-500/40'
      },
      pink: {
        gradient: 'from-pink-600 to-pink-700',
        border: 'border-pink-500/30',
        shadow: 'shadow-pink-500/20',
        text: 'text-pink-300',
        bg: 'from-slate-800/80 to-pink-900/30',
        borderLight: 'border-pink-500/20',
        relevancyBg: 'from-pink-600/20 to-purple-600/20',
        relevancyBorder: 'border-pink-500/40'
      },
      blue: {
        gradient: 'from-blue-600 to-blue-700',
        border: 'border-blue-500/30',
        shadow: 'shadow-blue-500/20',
        text: 'text-blue-300',
        bg: 'from-slate-800/80 to-blue-900/30',
        borderLight: 'border-blue-500/20',
        relevancyBg: 'from-blue-600/20 to-purple-600/20',
        relevancyBorder: 'border-blue-500/40'
      }
    };

    const scheme = colorSchemes[color];

    return (
  <div className="card-3d-wrapper">
    <div
      className={`api-card bg-gradient-to-br ${scheme.bg} backdrop-blur-xl rounded-2xl border ${scheme.border} overflow-hidden shadow-2xl ${scheme.shadow}`}
    >
      <div className={`bg-gradient-to-r ${scheme.gradient} p-4`}>
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          {apiData.name}
        </h3>
      </div>

      <div className="p-6 space-y-4">
        <div className={`bg-slate-900/50 rounded-xl p-4 border ${scheme.borderLight}`}>
          <p className={`text-sm ${scheme.text} mb-2 font-semibold`}>User:</p>
          <p className="text-gray-300 text-sm">{query}</p>
        </div>

        <div
          className={`
            bg-slate-900/50
            rounded-xl
            p-4
            border ${scheme.borderLight}
            max-h-[420px]
            overflow-auto
            relative
            scroll-smooth
            agent-scroll
          `}
        >
          <p className={`text-sm ${scheme.text} mb-3 font-semibold`}>Response:</p>
          {renderContent(apiData.data, index)}
        </div>

        <div className={`bg-gradient-to-r ${scheme.relevancyBg} rounded-xl p-4 border ${scheme.relevancyBorder}`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`${scheme.text} font-semibold flex items-center gap-2 text-sm`}>
              <TrendingUp className="w-4 h-4" />
              Relevancy Score
            </span>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              {apiData.relevancy !== undefined && apiData.relevancy !== null ? `${apiData.relevancy}%` : 'N/A'}
            </span>
          </div>
          <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 shadow-lg shadow-green-500/50"
              style={{ width: `${apiData.relevancy || 0}%` }}
            />
          </div>
        </div>
        <div className={`bg-gradient-to-r ${scheme.relevancyBg} rounded-xl p-4 border ${scheme.relevancyBorder}`}>
          <div className="flex items-center justify-between">
            <span className={`${scheme.text} font-semibold flex items-center gap-2 text-sm`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Response Time
            </span>
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              {apiData.fetchTime < 1000 
                ? `${Math.round(apiData.fetchTime)}ms`
                : `${(apiData.fetchTime / 1000).toFixed(2)}s`
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

  };

  return (
   <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8 noise-bg vignette relative overflow-hidden">
    <div className="glass-orb orb-purple"></div>
    <div className="glass-orb orb-pink"></div>
    <div className="glass-orb orb-blue"></div>

     <div className="light-blob blob-purple"></div>
     <div className="light-blob blob-pink"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-8 md:mb-12">
          <h1 className=" text-3xl md:text-5xl
  font-bold
  leading-[1.2]
  pt-2
  pb-2
  text-transparent
  bg-clip-text
  bg-gradient-to-r
  from-purple-400 via-pink-400 to-blue-400">
            Multi-Agent AI Analysis Dashboard
          </h1>
          <p className="text-gray-400 text-base md:text-lg">Compare, visualize, and evaluate responses from multiple AI systems</p>
        </div>

        <div className="mb-8 md:mb-12">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center bg-slate-800/90 backdrop-blur-xl rounded-2xl p-2 border border-purple-500/30 gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your query here..."
                disabled={loading}
                className="flex-1 bg-transparent px-4 md:px-6 py-3 md:py-4 text-white placeholder-gray-500 focus:outline-none text-base md:text-lg"
              />
              <button
                onClick={handleSubmit}
                disabled={loading || !query.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {results && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <APICard apiData={results.api1} color="purple" index={1} />
            <APICard apiData={results.api2} color="pink" index={2} />
            <APICard apiData={results.api3} color="blue" index={3} />
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiAPIQueryApp;