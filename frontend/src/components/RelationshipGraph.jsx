import React, { useState, useEffect, useRef, useCallback } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Network, 
  Target, 
  ShieldAlert, 
  ChevronRight, 
  Info, 
  Search,
  User,
  Link2,
  Zap,
  Maximize2,
  Building2,
  MessageSquareQuote
} from 'lucide-react';
import axios from 'axios';
import * as THREE from 'three';

const RelationshipGraph = ({ projectId }) => {
  const fgRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoverLink, setHoverLink] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/projects/${projectId}/connection-graph`, {
          withCredentials: true
        });
        setGraphData(response.data);
      } catch (error) {
        console.error('Failed to fetch connection graph:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId]);

  const handleNodeClick = useCallback(node => {
    const distance = 60;
    const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

    fgRef.current.cameraPosition(
      { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
      node,
      2000
    );
    setSelectedNode(node);
  }, [fgRef]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold tracking-widest uppercase text-xs">Mining Corporate & Social Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[750px] bg-slate-950 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl">
      
      {/* ── 3D Force Graph ── */}
      <ForceGraph3D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="#020617"
        showNavInfo={false}
        
        // Node Aesthetic: Teal (Social) vs Purple (Corporate)
        nodeThreeObject={node => {
          const color = node.category === 'Corporate' ? '#a855f7' : '#14b8a6'; // Purple vs Teal
          const group = new THREE.Group();

          // Glowing sphere
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(node.val * 2.5 + 2, 32, 32),
            new THREE.MeshPhongMaterial({ 
              color: color,
              emissive: color,
              emissiveIntensity: 0.6,
              transparent: true,
              opacity: 0.9
            })
          );
          group.add(sphere);

          // Add a glow ring for Power Brokers
          if (node.centrality > 0.1) {
            const ring = new THREE.Mesh(
              new THREE.TorusGeometry(node.val * 3 + 3, 0.5, 16, 100),
              new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.3 })
            );
            group.add(ring);
          }

          return group;
        }}
        
        // Link Aesthetic: Neon-teal pulsing lines
        linkColor={link => link.category === 'Corporate' ? '#a855f7' : '#0d9488'}
        linkWidth={link => (link.weight * 3)}
        linkDirectionalParticles={link => Math.ceil(link.weight * 5)}
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.006}
        linkDirectionalParticleColor={() => '#5eead4'}
        
        onNodeClick={handleNodeClick}
        onLinkHover={setHoverLink}
      />

      {/* ── UI Overlays ── */}
      <div className="absolute inset-0 pointer-events-none p-10">
        <div className="flex justify-between h-full items-start">
          
          {/* Header & Legend */}
          <div className="space-y-6 w-72 pointer-events-auto">
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-6 flex items-center gap-3">
                <Network className="h-6 w-6 text-cyan-400" />
                Board Influence Graph
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
                    <span className="text-xs font-bold text-slate-300">Social Intelligence</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-black px-2 py-0.5 bg-white/5 rounded italic">LinkdAPI</span>
                </div>
                
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
                    <span className="text-xs font-bold text-slate-300">Corporate Synergy</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-black px-2 py-0.5 bg-white/5 rounded italic">NinjaPear</span>
                </div>

                <div className="pt-6 border-t border-white/5 mt-6 grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Nodes</div>
                    <div className="text-2xl font-black text-white">{graphData.nodes.length}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-black uppercase mb-1">Pathways</div>
                    <div className="text-2xl font-black text-cyan-400">{graphData.links.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Alert: Power Broker */}
            <div className="bg-gradient-to-br from-purple-900/20 to-cyan-900/10 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
              <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 fill-cyan-400" /> Executive Power Broker
              </div>
              <div className="text-base font-black text-white mb-1">
                {graphData.nodes.sort((a,b) => b.centrality - a.centrality)[0]?.name}
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                Identified as the highest-leveraged bridge between the current board and the candidate pool.
              </p>
            </div>
          </div>

          {/* ── Link Narrative Hover Card ── */}
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 pointer-events-none">
            <AnimatePresence>
              {hoverLink && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-slate-900/90 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl p-5 shadow-[0_0_30px_rgba(34,211,238,0.15)]"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquareQuote className="h-4 w-4 text-cyan-400" />
                    <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em]">Connection Narrative</span>
                  </div>
                  <p className="text-sm text-white font-medium leading-relaxed">
                    {hoverLink.narrative}
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                      <Target className="h-3 w-3" /> Strength: {Math.round(hoverLink.weight * 100)}%
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${hoverLink.category === 'Corporate' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                      {hoverLink.category} Linked
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── 🎯 Strategic Alignment Card ── */}
          <div className="pointer-events-auto self-end">
            <AnimatePresence>
              {selectedNode && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  className="w-80 bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-10 opacity-5">
                    <Target className="h-32 w-32 text-cyan-400" />
                  </div>

                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedNode.category === 'Corporate' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'}`}>
                        {selectedNode.category} Profile
                      </div>
                      <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all">
                        <Maximize2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-2xl font-black text-white leading-tight">{selectedNode.name}</h4>
                      <p className="text-sm text-slate-400 font-medium mt-2">{selectedNode.subtext}</p>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-slate-950/50 rounded-2xl p-5 border border-white/5">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                          <Building2 className="h-3 w-3 text-cyan-400" /> Pathway Intelligence
                        </div>
                        
                        <div className="space-y-4">
                          {graphData.links
                            .filter(l => (l.source.id || l.source) === selectedNode.id || (l.target.id || l.target) === selectedNode.id)
                            .slice(0, 2)
                            .map((link, i) => {
                              const otherId = (link.source.id || link.source) === selectedNode.id ? (link.target.id || link.target) : (link.source.id || link.source);
                              const otherNode = graphData.nodes.find(n => n.id === otherId);
                              return (
                                <div key={i} className="group/item">
                                  <div className="flex justify-between items-end mb-1">
                                    <div className="text-[11px] font-black text-white group-hover/item:text-cyan-400 transition-colors">
                                      {otherNode?.name}
                                    </div>
                                    <div className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter">
                                      {Math.round(link.weight * 100)}% Match
                                    </div>
                                  </div>
                                  <div className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed italic">
                                    "{link.narrative}"
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 text-center">
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Centrality</div>
                          <div className="text-xl font-black text-white">{selectedNode.centrality}</div>
                        </div>
                        <button className="flex-[1.5] bg-cyan-600 text-white text-xs font-black rounded-2xl hover:bg-cyan-500 hover:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center gap-3 uppercase tracking-widest">
                          Deep Dive
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Controller Guide */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 pointer-events-none">
        <div className="px-6 py-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" /> Rotate View</div>
          <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" /> Zoom Scope</div>
          <div className="flex items-center gap-3"><span className="w-2 h-2 rounded-full bg-white/50 animate-pulse" /> Select Hub</div>
        </div>
      </div>

    </div>
  );
};

export default RelationshipGraph;
