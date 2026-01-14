// import React, { useState } from 'react';
// // Import the CSS module
// import styles from './App.module.css'; 

// // --- Components ---

// // Component to handle journal input
// function JournalInput({ onAnalyze, isLoading }) {
//   const [text, setText] = useState("");

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!text.trim()) return;
//     onAnalyze(text);
//   };

//   return (
//     // Use 'styles.journalForm' instead of Tailwind classes
//     <form onSubmit={handleSubmit} className={styles.journalForm}> 
//       <h2 className={styles.journalLabel}>How are you feeling?</h2>
//       <textarea
//         className={styles.journalTextarea}
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         placeholder="Write about your day, your thoughts, or any feelings..."
//         disabled={isLoading}
//       />
//       <button
//         type="submit"
//         className={styles.analyzeButton}
//         disabled={isLoading}
//       >
//         {isLoading ? 'Analyzing...' : 'Analyze My Mood'}
//       </button>
//     </form>
//   );
// }

// // Component to display the AI's analysis
// function MoodDisplay({ analysis }) {
//   if (!analysis) return null;

//   // We can still use inline styles for dynamic data
//   const moodStyle = {
//     borderColor: analysis.color_hex,
//   };
  
//   const titleStyle = {
//     color: analysis.color_hex,
//   };

//   return (
//     <div className={styles.moodDisplay} style={moodStyle}>
//       <h3 className={styles.moodTitle} style={titleStyle}>
//         Mood Detected: {analysis.mood}
//       </h3>
//       <p className={styles.moodSummary}>{analysis.summary}</p>
//     </div>
//   );
// }


// // --- Main App Component ---
// export default function App() {
//   const [analysis, setAnalysis] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const handleAnalyze = async (journalText) => {
//     setIsLoading(true);
//     setError(null);
//     setAnalysis(null);

//     try {
//       const response = await fetch("http://localhost:8000/analyze-mood/", {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ text: journalText }),
//       });

//       if (!response.ok) {
//         throw new Error("Network response was not ok");
//       }

//       const data = await response.json();
//       setAnalysis(data);

//     } catch (err) {
//       setError("Failed to analyze mood. Is the backend server running?");
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     // Use 'styles.container' for the main div
//     <div className={styles.container}> 
//       <div className={styles.header}>
//         <h1 className={styles.title}>MirrorMind 🧠</h1>
//         <p className={styles.subtitle}>Your AI Mental Fitness Companion</p>
//       </div>

//       <JournalInput onAnalyze={handleAnalyze} isLoading={isLoading} />

//       {error && (
//         <div className={styles.error}>
//           {error}
//         </div>
//       )}

//       <MoodDisplay analysis={analysis} />
//     </div>
//   );
// }

// import React, { useState, useEffect, useRef } from 'react';
// import styles from './App.module.css';

// // --- Components ---

// function JournalInput({ onAnalyze, isLoading, onTypingStatsChange }) {
//   const [text, setText] = useState("");

//   // --- Phase 2: Typing Analysis State ---
//   // We use useRef to store data that changes often without re-rendering
//   const keyPressData = useRef({
//     timestamps: [], // Stores timestamps of key presses
//     backspaces: 0,
//     totalKeys: 0,
//   });

//   // This effect sets up a "tick" to analyze typing data every 5 seconds
//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       // Get the data from the ref
//       const { timestamps, backspaces, totalKeys } = keyPressData.current;

//       // Ensure we have enough data to analyze
//       if (timestamps.length < 10) {
//         // Not enough typing to analyze
//         onTypingStatsChange(null); // Reset stats
//         return;
//       }

//       // 1. Calculate Time Elapsed (in minutes)
//       const firstPress = timestamps[0];
//       const lastPress = timestamps[timestamps.length - 1];
//       const timeElapsedMs = lastPress - firstPress;
//       const timeElapsedMin = timeElapsedMs / 1000 / 60;

//       // 2. Calculate Typing Speed (Words Per Minute)
//       // A "word" is standardized as 5 characters
//       const wpm = (totalKeys / 5) / timeElapsedMin;

//       // 3. Calculate Backspace (Error) Rate
//       const backspaceRate = (backspaces / totalKeys) * 100;

//       // 4. Calculate Average Latency (Pauses)
//       let totalLatency = 0;
//       for (let i = 1; i < timestamps.length; i++) {
//         totalLatency += timestamps[i] - timestamps[i - 1];
//       }
//       const avgLatency = totalLatency / (timestamps.length - 1); // in ms

//       // Send the calculated stats up to the main App
//       onTypingStatsChange({
//         wpm: Math.round(wpm),
//         errorRate: Math.round(backspaceRate),
//         avgLatency: Math.round(avgLatency),
//       });

//       // Clear the ref data for the next 5-second window
//       keyPressData.current = {
//         timestamps: [],
//         backspaces: 0,
//         totalKeys: 0,
//       };
//     }, 5000); // Analyze every 5 seconds

//     // Cleanup function to clear the interval when the component unmounts
//     return () => clearInterval(intervalId);
//   }, [onTypingStatsChange]); // Re-run effect if the callback changes

//   const handleKeyDown = (e) => {
//     // Record the timestamp of every key press
//     keyPressData.current.timestamps.push(e.timeStamp);
//     keyPressData.current.totalKeys += 1;

//     // Specifically count backspaces
//     if (e.key === 'Backspace') {
//       keyPressData.current.backspaces += 1;
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!text.trim()) return;
//     onAnalyze(text);
//   };

//   return (
//     <form onSubmit={handleSubmit} className={styles.journalForm}>
//       <h2 className={styles.journalLabel}>How are you feeling?</h2>
//       <textarea
//         className={styles.journalTextarea}
//         value={text}
//         onChange={(e) => setText(e.target.value)}
//         onKeyDown={handleKeyDown} // <-- ATTACH THE EVENT LISTENER HERE
//         placeholder="Write about your day, your thoughts, or any feelings..."
//         disabled={isLoading}
//       />
//       <button
//         type="submit"
//         className={styles.analyzeButton}
//         disabled={isLoading}
//       >
//         {isLoading ? 'Analyzing...' : 'Analyze My Mood'}
//       </button>
//     </form>
//   );
// }

// // (MoodDisplay component remains the same)
// function MoodDisplay({ analysis }) {
//   // ... (no changes here)
// }

// // --- Phase 2: New component to display typing stats ---
// function TypingStatsDisplay({ stats, stressLevel }) {
//   if (!stats) {
//     return (
//       <div className={styles.statsContainer}>
//         <p style={{color:'black'}}><b>Start typing to see your rhythm...</b></p>
//       </div>
//     );
//   }


//   // Determine stress color
//   const stressColor = {
//     Low: '#4ade80', // green
//     Medium: '#facc15', // yellow
//     High: '#f87171', // red
//   };
//   function VoiceRecorder() {
//   const [isRecording, setIsRecording] = useState(false);
//   const [voiceEmotion, setVoiceEmotion] = useState(null);
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [error, setError] = useState(null);

//   // We use useRef to hold the MediaRecorder and audio chunks
//   const mediaRecorder = useRef(null);
//   const audioChunks = useRef([]);

//   const startRecording = async () => {
//     setError(null);
//     setVoiceEmotion(null);
//     try {
//       // Get permission to use the microphone
//       const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
//       mediaRecorder.current = new MediaRecorder(stream);
      
//       // Clear old chunks
//       audioChunks.current = [];

//       // Fired when a chunk of audio data is ready
//       mediaRecorder.current.ondataavailable = (event) => {
//         audioChunks.current.push(event.data);
//       };

//       // Fired when recording stops
//       mediaRecorder.current.onstop = () => {
//         // Combine all chunks into a single audio blob
//         const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
//         // Send this blob to the backend
//         sendAudioToBackend(audioBlob);
        
//         // Stop the mic track
//         stream.getTracks().forEach(track => track.stop());
//       };

//       // Start recording
//       mediaRecorder.current.start();
//       setIsRecording(true);

//     } catch (err) {
//       console.error("Error accessing microphone:", err);
//       setError("Could not access microphone. Please check permissions.");
//     }
//   };

//   const stopRecording = () => {
//     if (mediaRecorder.current) {
//       mediaRecorder.current.stop();
//       setIsRecording(false);
//       setIsAnalyzing(true);
//     }
//   };

//   const sendAudioToBackend = async (audioBlob) => {
//     const formData = new FormData();
//     // 'file' must match the key in our FastAPI endpoint
//     formData.append("file", audioBlob, "recording.webm");

//     try {
//       const response = await fetch("http://localhost:8000/analyze-voice/", {
//         method: 'POST',
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error("Backend server error");
//       }

//       const data = await response.json();
//       if (data.error) {
//         setError(data.error);
//       } else {
//         setVoiceEmotion(data.emotion);
//       }
//     } catch (err) {
//       console.error("Error sending audio:", err);
//       setError("Failed to analyze voice. Is the backend running?");
//     } finally {
//       setIsAnalyzing(false);
//     }
//   };
  
//   const getButtonText = () => {
//     if (isAnalyzing) return "Analyzing...";
//     if (isRecording) return "Stop Recording ⏹️";
//     return "Record Voice 🎤";
//   };

//   return (
//     <div className={styles.statsContainer}>
//       <h3 className={styles.statsTitle}>Your Typing Rhythm</h3>
//       <div className={styles.statsGrid}>
//         <span>WPM: <strong>{stats.wpm}</strong></span>
//         <span>Error Rate: <strong>{stats.errorRate}%</strong></span>
//         <span>Pause (avg): <strong>{stats.avgLatency} ms</strong></span>
//       </div>
//       <div className={styles.stressLevel}>
//         Stress Level: 
//         <strong style={{ color: stressColor[stressLevel] }}>
//           {stressLevel}
//         </strong>
//       </div>
//     </div>
    
//   );
// }


// // --- Main App Component ---
// export default function App() {
//   const [analysis, setAnalysis] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // --- Phase 2: State for typing stats and stress ---
//   const [typingStats, setTypingStats] = useState(null);
//   const [stressLevel, setStressLevel] = useState('Low'); // 'Low', 'Medium', 'High'

//   // This is our simple "heuristic" model to infer stress
//   // This function runs every time the typingStats state is updated
//   useEffect(() => {
//     if (!typingStats) {
//       setStressLevel('Low');
//       return;
//     }

//     // --- Simple Stress Scoring Logic (Heuristics) ---
//     // You can tune these numbers! This is just a starting point.
//     // A "normal" baseline might be: WPM > 40, Error Rate < 5%, Latency < 200ms
//     let score = 0;

//     // High error rate is a strong signal
//     if (typingStats.errorRate > 10) {
//       score += 2;
//     } else if (typingStats.errorRate > 5) {
//       score += 1;
//     }

//     // Very erratic/slow pausing is a signal
//     if (typingStats.avgLatency > 300) {
//       score += 2;
//     } else if (typingStats.avgLatency > 200) {
//       score += 1;
//     }
    
//     // Very slow typing is a signal
//     if (typingStats.wpm < 30) {
//       score += 1;
//     }

//     // Set the final stress level
//     if (score >= 4) {
//       setStressLevel('High');
//     } else if (score >= 2) {
//       setStressLevel('Medium');
//     } else {
//       setStressLevel('Low');
//     }
//   }, [typingStats]); // Re-run this logic whenever typingStats changes


//   const handleAnalyze = async (journalText) => {
//     // ... (no changes here)
//   };

//   return (
//     <div className={styles.container}>
//       <div className={styles.header}>
//         <h1 className={styles.title}>MirrorMind 🧠</h1>
//         <p className={styles.subtitle}>Your AI Mental Fitness Companion</p>
//       </div>

//       <JournalInput
//         onAnalyze={handleAnalyze}
//         isLoading={isLoading}
//         onTypingStatsChange={setTypingStats} // <-- Pass the "setter" down
//       />

//       {/* --- Phase 2: Add the new stats display --- */}
//       <TypingStatsDisplay stats={typingStats} stressLevel={stressLevel} />

//       {error && (
//         <div className={styles.error}>
//           {error}
//         </div>
//       )}

//       <MoodDisplay analysis={analysis} />
//     </div>
//   );
// }

import React, { useState, useEffect, useRef, useMemo } from 'react';
import styles from './App.module.css'; // Make sure you have this file
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { saveData, loadData } from './dataLogger.js';
// --- Component 1: Journal Input (Phases 1 & 2) ---
function JournalInput({ onAnalyze, isLoading, onTypingStatsChange }) {
  const [text, setText] = useState("");

  // --- Phase 2: Typing Analysis State ---
  const keyPressData = useRef({
    timestamps: [], // Stores timestamps of key presses
    backspaces: 0,
    totalKeys: 0,
  });

  // This effect sets up a "tick" to analyze typing data every 5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      const { timestamps, backspaces, totalKeys } = keyPressData.current;

      if (timestamps.length < 10) {
        onTypingStatsChange(null); // Reset stats
        return;
      }

      // 1. Calculate Time Elapsed (in minutes)
      const firstPress = timestamps[0];
      const lastPress = timestamps[timestamps.length - 1];
      const timeElapsedMs = lastPress - firstPress;
      const timeElapsedMin = timeElapsedMs / 1000 / 60;

      // 2. Calculate Typing Speed (Words Per Minute)
      const wpm = (totalKeys / 5) / timeElapsedMin;

      // 3. Calculate Backspace (Error) Rate
      const backspaceRate = (backspaces / totalKeys) * 100;

      // 4. Calculate Average Latency (Pauses)
      let totalLatency = 0;
      for (let i = 1; i < timestamps.length; i++) {
        totalLatency += timestamps[i] - timestamps[i - 1];
      }
      const avgLatency = totalLatency / (timestamps.length - 1); // in ms

      onTypingStatsChange({
        wpm: Math.round(wpm),
        errorRate: Math.round(backspaceRate),
        avgLatency: Math.round(avgLatency),
      });

      // Clear the ref data for the next 5-second window
      keyPressData.current = {
        timestamps: [],
        backspaces: 0,
        totalKeys: 0,
      };
    }, 5000); // Analyze every 5 seconds

    return () => clearInterval(intervalId); // Cleanup
  }, [onTypingStatsChange]);

  const handleKeyDown = (e) => {
    keyPressData.current.timestamps.push(e.timeStamp);
    keyPressData.current.totalKeys += 1;
    if (e.key === 'Backspace') {
      keyPressData.current.backspaces += 1;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAnalyze(text);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.journalForm}>
      <h2 className={styles.journalLabel}>How are you feeling?</h2>
      <textarea
        className={styles.journalTextarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown} // Attach the keydown listener
        placeholder="Write about your day, your thoughts, or any feelings..."
        disabled={isLoading}
      />
      <button
        type="submit"
        className={styles.analyzeButton}
        disabled={isLoading}
      >
        {isLoading ? 'Analyzing...' : 'Analyze My Mood'}
      </button>
    </form>
  );
}

// --- Component 2: Mood Display (Phase 1) ---
function MoodDisplay({ analysis }) {
  if (!analysis) return null;

  const moodStyle = {
    borderColor: analysis.color_hex,
  };
  
  const titleStyle = {
    color: analysis.color_hex,
  };

  return (
    <div className={styles.moodDisplay} style={moodStyle}>
      <h3 className={styles.moodTitle} style={titleStyle}>
        Mood Detected: {analysis.mood}
      </h3>
      <p className={styles.moodSummary}>{analysis.summary}</p>
    </div>
  );
}

// --- Component 3: Typing Stats Display (Phase 2) ---
function TypingStatsDisplay({ stats, stressLevel }) {
  if (!stats) {
    return (
      <div className={styles.statsContainer}>
        <p>Start typing to see your rhythm...</p>
      </div>
    );
  }

  // Determine stress color
  const stressColor = {
    Low: '#4ade80', // green
    Medium: '#facc15', // yellow
    High: '#f87171', // red
  };

  return (
    <div className={styles.statsContainer}>
      <h3 className={styles.statsTitle}>Your Typing Rhythm</h3>
      <div className={styles.statsGrid}>
        <span>WPM: <strong>{stats.wpm}</strong></span>
        <span>Error Rate: <strong>{stats.errorRate}%</strong></span>
        <span>Pause (avg): <strong>{stats.avgLatency} ms</strong></span>
      </div>
      <div className={styles.stressLevel}>
        Stress Level: 
        <strong style={{ color: stressColor[stressLevel] }}>
          {stressLevel}
        </strong>
      </div>
    </div>
  );
}

// --- Component 4: Voice Recorder (Phase 3) ---
function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceEmotion, setVoiceEmotion] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    setError(null);
    setVoiceEmotion(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        sendAudioToBackend(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);

    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      setIsAnalyzing(true);
    }
  };

  const sendAudioToBackend = async (audioBlob) => {
    const formData = new FormData();
    formData.append("file", audioBlob, "recording.webm");

    try {
      const response = await fetch("https://mirrormind-8dy0.onrender.com/analyze-voice", {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Backend server error");
      }

      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setVoiceEmotion(data.emotion);
        saveData({ type: 'voice', value: data.emotion });
      }
    } catch (err) {
      console.error("Error sending audio:", err);
      setError("Failed to analyze voice. Is the backend running?");
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  const getButtonText = () => {
    if (isAnalyzing) return "Analyzing...";
    if (isRecording) return "Stop Recording ⏹️";
    return "Record Voice 🎤";
  };

  return (
    <div className={styles.voiceContainer}>
      <button 
        onClick={isRecording ? stopRecording : startRecording}
        className={styles.voiceButton}
        disabled={isAnalyzing}
      >
        {getButtonText()}
      </button>
      
      {voiceEmotion && (
        <div className={styles.voiceResult}>
          Detected Voice Emotion: <strong>{voiceEmotion}</strong>
        </div>
      )}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}

// --- Component 5: Break Nudge Modal (Phase 4) ---
function BreakNudgeModal({ show, onClose }) {
  if (!show) {
    return null;
  }

  return (
    // The semi-transparent background
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h3 className={styles.modalTitle}>Quick Reset? 🧘</h3>
        <p className={styles.modalText}>
          Your typing rhythm seems a bit stressed. Taking a 2-minute break 
          to stand, stretch, or focus on your breathing can make a big difference.
        </p>
        <button 
          className={styles.modalButton} 
          onClick={onClose}
        >
          Got it, thanks
        </button>
      </div>
    </div>
  );
}

// --- Component 6: Dashboard (Phase 5 - OPTIMIZED) ---
function Dashboard() {
  const [data, setData] = useState([]);

  // Load data from localStorage only once when component mounts
  useEffect(() => {
    setData(loadData());
  }, []);

  // --- Process data for charts ---
  
  // 1. Memoize Mood Data for Pie Chart
  const moodData = useMemo(() => {
    console.log("Memo: Recalculating Mood Data"); // You'll see this in console
    const moodCounts = data
      .filter(d => d.type === 'mood')
      .reduce((acc, curr) => {
        const mood = curr.value || 'Unknown';
        acc[mood] = (acc[mood] || 0) + 1;
        return acc;
      }, {});
    
    return Object.keys(moodCounts).map(key => ({
      name: key,
      value: moodCounts[key],
    }));
  }, [data]); // Only re-run if 'data' state changes

  const MOOD_COLORS = {
    'Positive': '#4ade80', // green
    'Negative': '#f87171', // red
    'Neutral': '#60a5fa', // blue
    // ... add more as you see them
  };

  // 2. Memoize Stress Data for Bar Chart
  const stressData = useMemo(() => {
    console.log("Memo: Recalculating Stress Data"); // You'll see this in console
    const stressCounts = data
      .filter(d => d.type === 'stress')
      .reduce((acc, curr) => {
        const level = curr.value || 'Unknown';
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      }, {});

    return [
      { name: 'Low', count: stressCounts['Low'] || 0 },
      { name: 'Medium', count: stressCounts['Medium'] || 0 },
      { name: 'High', count: stressCounts['High'] || 0 },
    ];
  }, [data]); // Only re-run if 'data' state changes

  // 3. Memoize Recent Activity
  const recentActivity = useMemo(() => {
    console.log("Memo: Recalculating Recent Activity"); // You'll see this in console
    return data.slice(-5).reverse(); // Get last 5, newest first
  }, [data]); // Only re-run if 'data' state changes

  if (data.length === 0) {
    return (
      <div className={styles.dashboardContainer}>
        <h2 className={styles.dashboardTitle}>Your Dashboard</h2>
        <p>No data recorded yet. Use the app to see your trends!</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <h2 className={styles.dashboardTitle}>Your Dashboard</h2>
      
      <div className={styles.chartsGrid}>
        {/* Mood Pie Chart */}
        <div className={styles.chartBox}>
          <h3>Mood Analysis</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={moodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                {moodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={MOOD_COLORS[entry.name] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stress Bar Chart */}
        <div className={styles.chartBox}>
          <h3>Typing Stress Events</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stressData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count">
                <Cell fill={stressData[0].name === 'Low' ? '#4ade80' : '#8884d8'} />
                <Cell fill={stressData[1].name === 'Medium' ? '#facc15' : '#8884d8'} />
                <Cell fill={stressData[2].name === 'High' ? '#f87171' : '#8884d8'} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={styles.activityBox}>
        <h3>Recent Activity</h3>
        <ul>
          {recentActivity.map((item) => (
            <li key={item.timestamp}>
              <strong>{new Date(item.timestamp).toLocaleString()}: </strong>
              {item.type === 'mood' && `Analyzed mood as ${item.value}.`}
              {item.type === 'stress' && `Typing stress changed to ${item.value}.`}
              {item.type === 'voice' && `Detected voice emotion: ${item.value}.`}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
// --- Main App Component ---
export default function App() {
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [typingStats, setTypingStats] = useState(null);
  const [stressLevel, setStressLevel] = useState('Low'); // 'Low', 'Medium', 'High'
  const [showNudgeModal, setShowNudgeModal] = useState(false);
  const nudgeTimer = useRef(null);
  // This is our simple "heuristic" model to infer stress
  useEffect(() => {
    if (!typingStats) {
      // setStressLevel('Low');
      return;
    }

    // --- Simple Stress Scoring Logic (Heuristics) ---
    let score = 0;
    if (typingStats.errorRate > 10) score += 2;
    else if (typingStats.errorRate > 5) score += 1;

    if (typingStats.avgLatency > 300) score += 2;
    else if (typingStats.avgLatency > 200) score += 1;
    
    if (typingStats.wpm < 30) score += 1;
    let newStressLevel = stressLevel; // Start with the current level

    if (score >= 4) {
      newStressLevel = 'High';
    } else if (score >= 2) {
      newStressLevel = 'Medium';
    } else {
      newStressLevel = 'Low';
    }

    if (newStressLevel !== stressLevel) {
      // --- SAVE DATA (Phase 5) ---
      // Only save when the stress level changes
      setStressLevel(newStressLevel);
      saveData({ type: 'stress', value: newStressLevel, stats: typingStats });
      // ---------------------------
    }
    
  }, [typingStats, stressLevel]); // Add stressLevel to dependency array
  
  // --- Phase 4: New useEffect for Nudge Timer ---
  useEffect(() => {
    // This effect runs every time the stressLevel changes
    
    if (stressLevel === 'High' && !nudgeTimer.current) {
      // If stress is High and a timer isn't already running...
      // Start a 1-minute timer.
      console.log("High stress detected. Starting 5-minute timer for nudge...");
      nudgeTimer.current = setTimeout(() => {
        console.log("Timer elapsed. Showing nudge modal.");
        setShowNudgeModal(true); // Show the modal
      }, 10000); // 60,000 ms = 1 minute. (You can make this shorter for testing)

    } else if (stressLevel !== 'High' && nudgeTimer.current) {
      // If stress is no longer High and a timer IS running...
      // Cancel the timer.
      console.log("Stress level reduced. Clearing nudge timer.");
      clearTimeout(nudgeTimer.current);
      nudgeTimer.current = null;
    }

    // Cleanup function in case the component unmounts
    return () => {
      if (nudgeTimer.current) {
        clearTimeout(nudgeTimer.current);
      }
    };
  }, [stressLevel]); // This hook depends only on the stressLevel
  
  // Handler for the text analysis
  const handleAnalyze = async (journalText) => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const response = await fetch("https://mirrormind-8dy0.onrender.com/analyze-mood", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: journalText }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      setAnalysis(data);
      saveData({ type: 'mood', value: data.mood, summary: data.summary });
    } catch (err) {
      setError("Failed to analyze mood. Is the backend server running?");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  // --- Phase 4: New Handler to Close the Modal ---
  const closeNudgeModal = () => {
    setShowNudgeModal(false);
    // IMPORTANT: We clear the timer ref here.
    // This acts as a "snooze". If stress is still high,
    // the useEffect will see timer is null and start a *new* 1-minute timer.
    if (nudgeTimer.current) {
      clearTimeout(nudgeTimer.current);
    }
    nudgeTimer.current = null;
  };

  // --- Render the final application ---
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <BreakNudgeModal show={showNudgeModal} onClose={closeNudgeModal} />
        <h1 className={styles.title}>MirrorMind 🧠</h1>
        <p className={styles.subtitle}>Your AI Mental Fitness Companion</p>
      </div>

      {/* --- Voice Recorder (Phase 3) --- */}
      <Dashboard />
      <VoiceRecorder />

      {/* --- Text Journal (Phase 1) + Typing Monitor (Phase 2) --- */}
      <JournalInput
        onAnalyze={handleAnalyze}
        isLoading={isLoading}
        onTypingStatsChange={setTypingStats}
      />
      
      {/* --- Typing Stats Display (Phase 2) --- */}
      <TypingStatsDisplay stats={typingStats} stressLevel={stressLevel} />
      
      {/* --- Error display for text analysis --- */}
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {/* --- Mood Display (Phase 1) --- */}
      <MoodDisplay analysis={analysis} />
    </div>
  );
}
