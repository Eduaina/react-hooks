import React, { useReducer, useCallback } from "react";
import SelectField from "./components/Select";
import moods from "./store/mood.json";
import genres from "./store/genre.json";
import "./App.css";

const initialState = {
  genre: "",
  mood: "",
  level: "",
  responses: [],
  loading: false,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_GENRE":
      return { ...state, genre: action.payload, mood: "" };

    case "SET_MOOD":
      return { ...state, mood: action.payload };

    case "SET_LEVEL":
      return { ...state, level: action.payload };

    case "FETCH_START":
      return { ...state, loading: true, error: null, responses: [] };

    case "FETCH_SUCCESS":
      return { ...state, loading: false, responses: action.payload };

    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { genre, mood, level, responses, loading, error } = state;

  const availableMoods = moods[genre] || [];

  const fetchRecommendations = useCallback(async () => {
    if (!genre || !mood || !level) {
      dispatch({
        type: "FETCH_ERROR",
        payload: "Please select Genre, Mood, and Level.",
      });
      return;
    }

    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      dispatch({
        type: "FETCH_ERROR",
        payload: "API key is missing. Please set VITE_GEMINI_API_KEY.",
      });
      return;
    }

    dispatch({ type: "FETCH_START" });

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Recommend 5 ${genre} books for a ${level} reader who is feeling ${mood}. Give brief explanations.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }

      const data = await res.json();

      dispatch({
        type: "FETCH_SUCCESS",
        payload: data?.candidates || [],
      });
    } catch (err) {
      console.error(err);
      dispatch({
        type: "FETCH_ERROR",
        payload: "Failed to fetch recommendations. Check API key or quota.",
      });
    }
  }, [genre, mood, level]);

  return (
    <section>
      <h1>Recommendation Generator</h1>

      <SelectField
        placeholder="Genre"
        options={genres}
        value={genre}
        onSelect={(val) => dispatch({ type: "SET_GENRE", payload: val })}
      />

      <SelectField
        placeholder="Mood"
        options={availableMoods}
        value={mood}
        onSelect={(val) => dispatch({ type: "SET_MOOD", payload: val })}
      />

      <SelectField
        placeholder="Level"
        options={["Beginner", "Intermediate", "Expert"]}
        value={level}
        onSelect={(val) => dispatch({ type: "SET_LEVEL", payload: val })}
      />

      <br />

      <button onClick={fetchRecommendations} disabled={loading}>
        {loading ? "Thinking..." : "See Recommendations"}
      </button>

      <br />
      <br />

      {error && <p className="error">{error}</p>}

      {responses.map((item, index) => (
        <details key={index}>
          <summary>Recommendation {index + 1}</summary>
          <p>
            {item?.content?.parts
              ?.map((part) => part.text)
              .join(" ")}
          </p>
        </details>
      ))}
    </section>
  );
}
