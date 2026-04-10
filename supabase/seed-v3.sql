-- =============================================
-- Knowledge Nexus - Expanded Seed Data v3
-- Radial tree: elementary -> advanced
-- Math + Physics + Chemistry + Biology
-- =============================================
-- Run this AFTER schema.sql. This seed clears prior graph data first.

TRUNCATE mastery_question_options, mastery_questions, mastery_tests,
         mastery_attempts, user_node_progress,
         prerequisites, edges, nodes, subjects
CASCADE;

DO $$
DECLARE
  -- Subject IDs
  v_sub_math UUID := uuid_generate_v4();
  v_sub_physics UUID := uuid_generate_v4();
  v_sub_chemistry UUID := uuid_generate_v4();
  v_sub_biology UUID := uuid_generate_v4();

  -- Mathematics nodes
  v_basic_arithmetic UUID := uuid_generate_v4();
  v_fractions UUID := uuid_generate_v4();
  v_basic_geometry UUID := uuid_generate_v4();
  v_algebra UUID := uuid_generate_v4();
  v_functions UUID := uuid_generate_v4();
  v_trigonometry UUID := uuid_generate_v4();
  v_vectors UUID := uuid_generate_v4();
  v_limits UUID := uuid_generate_v4();
  v_derivatives UUID := uuid_generate_v4();
  v_integration UUID := uuid_generate_v4();
  v_matrices UUID := uuid_generate_v4();
  v_differential_eq UUID := uuid_generate_v4();
  v_multivariable_calc UUID := uuid_generate_v4();
  v_linear_algebra UUID := uuid_generate_v4();
  v_real_analysis UUID := uuid_generate_v4();
  v_abstract_algebra UUID := uuid_generate_v4();

  -- Physics nodes
  v_measurement UUID := uuid_generate_v4();
  v_basic_motion UUID := uuid_generate_v4();
  v_velocity UUID := uuid_generate_v4();
  v_acceleration UUID := uuid_generate_v4();
  v_gravity UUID := uuid_generate_v4();
  v_force UUID := uuid_generate_v4();
  v_newtons_laws UUID := uuid_generate_v4();
  v_energy UUID := uuid_generate_v4();
  v_momentum UUID := uuid_generate_v4();
  v_thermodynamics UUID := uuid_generate_v4();
  v_electromagnetism UUID := uuid_generate_v4();
  v_waves UUID := uuid_generate_v4();
  v_quantum_intro UUID := uuid_generate_v4();
  v_special_relativity UUID := uuid_generate_v4();

  -- Chemistry nodes
  v_matter_measurement UUID := uuid_generate_v4();
  v_atomic_structure UUID := uuid_generate_v4();
  v_periodic_table UUID := uuid_generate_v4();
  v_chemical_bonding UUID := uuid_generate_v4();
  v_stoichiometry UUID := uuid_generate_v4();
  v_chemical_reactions UUID := uuid_generate_v4();
  v_thermochemistry UUID := uuid_generate_v4();
  v_acids_bases UUID := uuid_generate_v4();
  v_organic_chemistry UUID := uuid_generate_v4();
  v_biochemistry UUID := uuid_generate_v4();

  -- Biology nodes
  v_biomolecules UUID := uuid_generate_v4();
  v_cell_structure UUID := uuid_generate_v4();
  v_dna_genetics UUID := uuid_generate_v4();
  v_cell_division UUID := uuid_generate_v4();
  v_evolution UUID := uuid_generate_v4();
  v_photosynthesis UUID := uuid_generate_v4();
  v_homeostasis UUID := uuid_generate_v4();
  v_ecology UUID := uuid_generate_v4();
  v_human_physiology UUID := uuid_generate_v4();
  v_molecular_biology UUID := uuid_generate_v4();

  -- Test IDs
  v_test_arithmetic UUID := uuid_generate_v4();
  v_test_functions UUID := uuid_generate_v4();
  v_test_derivatives UUID := uuid_generate_v4();
  v_test_velocity UUID := uuid_generate_v4();
  v_test_newtons UUID := uuid_generate_v4();
  v_test_atomic_structure UUID := uuid_generate_v4();
  v_test_cell_structure UUID := uuid_generate_v4();

  -- Question IDs
  v_q_arith_1 UUID := uuid_generate_v4();
  v_q_arith_2 UUID := uuid_generate_v4();
  v_q_arith_3 UUID := uuid_generate_v4();
  v_q_func_1 UUID := uuid_generate_v4();
  v_q_func_2 UUID := uuid_generate_v4();
  v_q_func_3 UUID := uuid_generate_v4();
  v_q_deriv_1 UUID := uuid_generate_v4();
  v_q_deriv_2 UUID := uuid_generate_v4();
  v_q_deriv_3 UUID := uuid_generate_v4();
  v_q_vel_1 UUID := uuid_generate_v4();
  v_q_vel_2 UUID := uuid_generate_v4();
  v_q_vel_3 UUID := uuid_generate_v4();
  v_q_newton_1 UUID := uuid_generate_v4();
  v_q_newton_2 UUID := uuid_generate_v4();
  v_q_newton_3 UUID := uuid_generate_v4();
  v_q_atom_1 UUID := uuid_generate_v4();
  v_q_atom_2 UUID := uuid_generate_v4();
  v_q_atom_3 UUID := uuid_generate_v4();
  v_q_cell_1 UUID := uuid_generate_v4();
  v_q_cell_2 UUID := uuid_generate_v4();
  v_q_cell_3 UUID := uuid_generate_v4();
BEGIN

INSERT INTO subjects (id, name, color, description, icon) VALUES
  (v_sub_math, 'Mathematics', '#3b82f6', 'The study of quantity, structure, space, and change.', '📐'),
  (v_sub_physics, 'Physics', '#8b5cf6', 'The science of matter, motion, energy, and forces.', '⚛️'),
  (v_sub_chemistry, 'Chemistry', '#14b8a6', 'The study of substances, their structure, properties, and transformations.', '🧪'),
  (v_sub_biology, 'Biology', '#84cc16', 'The study of living systems, from cells to ecosystems.', '🧬');

-- Mathematics
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
  (v_basic_arithmetic, 'Basic Arithmetic', 'basic-arithmetic', v_sub_math, 'Number Theory',
   'Addition, subtraction, multiplication, and division are the basic operations used throughout mathematics.',
   'Arithmetic is the starting point for every quantitative subject.',
   ARRAY['Budgeting', 'Measurement', 'Everyday calculations', 'Foundation for higher math'], 1, 0, 0),
  (v_fractions, 'Fractions and Ratios', 'fractions-ratios', v_sub_math, 'Number Theory',
   'Fractions represent parts of a whole and ratios compare quantities.',
   'Fractions and ratios are essential for proportions, probability, and algebra.',
   ARRAY['Recipes', 'Percentages', 'Scaling formulas', 'Statistics'], 1, 0, 0),
  (v_basic_geometry, 'Basic Geometry', 'basic-geometry', v_sub_math, 'Geometry',
   'Geometry introduces shapes, lines, angles, area, and volume.',
   'It develops spatial reasoning that supports science, engineering, and design.',
   ARRAY['Architecture', 'Drawing', 'Construction', 'Computer graphics'], 1, 0, 0),
  (v_algebra, 'Algebra', 'algebra', v_sub_math, 'Algebra',
   'Algebra introduces variables, equations, and symbolic reasoning.',
   'It is the language used to express patterns and solve for unknowns.',
   ARRAY['Modeling relationships', 'Programming logic', 'Data analysis', 'Problem solving'], 2, 0, 0),
  (v_functions, 'Functions', 'functions', v_sub_math, 'Algebra',
   'A function maps each input to exactly one output.',
   'Functions are the backbone of mathematical modeling and later calculus.',
   ARRAY['Graphs', 'Programming', 'Modeling systems', 'Machine learning'], 2, 0, 0),
  (v_trigonometry, 'Trigonometry', 'trigonometry', v_sub_math, 'Geometry',
   'Trigonometry studies angle relationships through sine, cosine, tangent, and identities.',
   'It connects geometry to waves, rotations, and periodic motion.',
   ARRAY['Waves', 'Surveying', 'Signal processing', 'Navigation'], 2, 0, 0),
  (v_vectors, 'Vectors', 'vectors', v_sub_math, 'Linear Algebra',
   'Vectors have magnitude and direction and can be added or scaled.',
   'They are central to physics, graphics, and multivariable thinking.',
   ARRAY['Forces', 'Velocity', '3D graphics', 'Machine learning'], 2, 0, 0),
  (v_limits, 'Limits', 'limits', v_sub_math, 'Calculus',
   'Limits describe how a function behaves as an input approaches a value.',
   'They provide the formal bridge from algebra to calculus.',
   ARRAY['Derivatives', 'Continuity', 'Series', 'Model behavior'], 3, 0, 0),
  (v_derivatives, 'Derivatives', 'derivatives', v_sub_math, 'Calculus',
   'Derivatives measure instantaneous rate of change.',
   'They are used for optimization, motion, and gradient-based methods.',
   ARRAY['Velocity', 'Optimization', 'Curve analysis', 'Machine learning'], 3, 0, 0),
  (v_integration, 'Integration', 'integration', v_sub_math, 'Calculus',
   'Integration accumulates quantities and reverses differentiation.',
   'It turns rates into totals such as distance, area, or work.',
   ARRAY['Area', 'Volume', 'Work', 'Probability'], 3, 0, 0),
  (v_matrices, 'Matrices', 'matrices', v_sub_math, 'Linear Algebra',
   'Matrices organize numbers in rows and columns for transformations and systems of equations.',
   'They support graphics, statistics, and many modern computational methods.',
   ARRAY['Linear systems', 'Transformations', 'PCA', 'Neural networks'], 3, 0, 0),
  (v_differential_eq, 'Differential Equations', 'differential-equations', v_sub_math, 'Calculus',
   'Differential equations relate functions to their derivatives to model change over time.',
   'They are used across physics, chemistry, biology, and engineering.',
   ARRAY['Population models', 'Circuits', 'Fluid flow', 'Control systems'], 4, 0, 0),
  (v_multivariable_calc, 'Multivariable Calculus', 'multivariable-calculus', v_sub_math, 'Calculus',
   'This extends calculus to functions of several variables with gradients and multiple integrals.',
   'Real systems often depend on many variables at once.',
   ARRAY['Field analysis', 'Optimization', 'Fluid models', 'Data science'], 4, 0, 0),
  (v_linear_algebra, 'Advanced Linear Algebra', 'advanced-linear-algebra', v_sub_math, 'Linear Algebra',
   'Advanced linear algebra studies vector spaces, linear transformations, eigenvalues, and decompositions.',
   'It underpins modern data science, quantum theory, and signal processing.',
   ARRAY['SVD', 'Quantum states', 'Recommendation systems', 'Compression'], 4, 0, 0),
  (v_real_analysis, 'Real Analysis', 'real-analysis', v_sub_math, 'Analysis',
   'Real analysis gives rigorous foundations for limits, continuity, and convergence.',
   'It sharpens mathematical reasoning and supports advanced theory.',
   ARRAY['Proofs', 'Probability theory', 'Functional analysis', 'Theoretical ML'], 5, 0, 0),
  (v_abstract_algebra, 'Abstract Algebra', 'abstract-algebra', v_sub_math, 'Algebra',
   'Abstract algebra studies structures such as groups, rings, and fields.',
   'It powers cryptography, symmetry analysis, and theoretical computer science.',
   ARRAY['Cryptography', 'Coding theory', 'Symmetry', 'Pure mathematics'], 5, 0, 0);

-- Physics
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
  (v_measurement, 'Measurement and Units', 'measurement-units', v_sub_physics, 'Foundations',
   'Physics begins with accurate measurement, units, and dimensional analysis.',
   'Without consistent units, physical reasoning breaks down quickly.',
   ARRAY['Lab work', 'Engineering specs', 'Conversions', 'Experiment design'], 1, 0, 0),
  (v_basic_motion, 'Basic Motion', 'basic-motion', v_sub_physics, 'Kinematics',
   'Basic motion covers position, distance, displacement, speed, and simple motion graphs.',
   'It builds intuition before formal kinematics and dynamics.',
   ARRAY['Sports', 'Traffic analysis', 'Animation', 'Motion planning'], 1, 0, 0),
  (v_velocity, 'Velocity', 'velocity', v_sub_physics, 'Kinematics',
   'Velocity measures rate of change of position and includes direction.',
   'It connects motion to calculus and prediction.',
   ARRAY['Trajectories', 'Vehicle dynamics', 'Robotics', 'Space flight'], 2, 0, 0),
  (v_acceleration, 'Acceleration', 'acceleration', v_sub_physics, 'Kinematics',
   'Acceleration measures rate of change of velocity.',
   'It explains speeding up, slowing down, and turning.',
   ARRAY['Braking distance', 'Rocket launch', 'Roller coasters', 'Safety analysis'], 2, 0, 0),
  (v_gravity, 'Gravity', 'gravity', v_sub_physics, 'Dynamics',
   'Gravity is the attractive interaction between masses.',
   'It shapes falling objects, planetary motion, and large-scale structure.',
   ARRAY['Satellites', 'Structures', 'Orbits', 'Astrophysics'], 2, 0, 0),
  (v_force, 'Force', 'force', v_sub_physics, 'Dynamics',
   'A force is a push or pull that changes motion.',
   'Force links cause to acceleration and motion.',
   ARRAY['Mechanics', 'Engineering', 'Biomechanics', 'Aerospace'], 3, 0, 0),
  (v_newtons_laws, 'Newton''s Laws of Motion', 'newtons-laws', v_sub_physics, 'Dynamics',
   'Newton''s laws describe inertia, force, acceleration, and action-reaction pairs.',
   'They are the foundation of classical mechanics.',
   ARRAY['Crash analysis', 'Machine design', 'Sports physics', 'Orbital mechanics'], 3, 0, 0),
  (v_energy, 'Energy', 'energy', v_sub_physics, 'Mechanics',
   'Energy is the capacity to do work and appears in many forms.',
   'Conservation of energy is one of the most powerful ideas in science.',
   ARRAY['Power systems', 'Climate science', 'Mechanics', 'Thermal analysis'], 3, 0, 0),
  (v_momentum, 'Momentum', 'momentum', v_sub_physics, 'Mechanics',
   'Momentum measures motion as mass times velocity and is conserved in isolated systems.',
   'It is essential for collisions and propulsion.',
   ARRAY['Collisions', 'Rocket propulsion', 'Sports', 'Particle physics'], 3, 0, 0),
  (v_thermodynamics, 'Thermodynamics', 'thermodynamics', v_sub_physics, 'Thermal Physics',
   'Thermodynamics studies heat, work, entropy, and energy transfer.',
   'It explains engines, refrigeration, and natural energy flow.',
   ARRAY['Engines', 'HVAC', 'Power plants', 'Chemical systems'], 4, 0, 0),
  (v_electromagnetism, 'Electromagnetism', 'electromagnetism', v_sub_physics, 'E&M',
   'Electromagnetism unifies electric and magnetic interactions.',
   'It explains electricity, light, circuits, and modern electronics.',
   ARRAY['Power grids', 'Communication', 'MRI', 'Semiconductors'], 4, 0, 0),
  (v_waves, 'Waves and Oscillations', 'waves-oscillations', v_sub_physics, 'Wave Physics',
   'Waves transfer energy and oscillations describe repeated motion.',
   'This topic links sound, light, signals, and quantum ideas.',
   ARRAY['Acoustics', 'Optics', 'Communications', 'Seismology'], 4, 0, 0),
  (v_quantum_intro, 'Introduction to Quantum Mechanics', 'quantum-mechanics-intro', v_sub_physics, 'Quantum',
   'Quantum mechanics describes matter and energy at atomic scales.',
   'It explains atoms, bonding, semiconductors, and lasers.',
   ARRAY['Materials science', 'Lasers', 'Quantum computing', 'Chemistry'], 5, 0, 0),
  (v_special_relativity, 'Special Relativity', 'special-relativity', v_sub_physics, 'Relativity',
   'Special relativity studies space, time, and energy at high speeds.',
   'It matters for particle physics, GPS, and modern physics.',
   ARRAY['GPS', 'Particle accelerators', 'Astrophysics', 'Nuclear physics'], 5, 0, 0);

-- Chemistry
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
  (v_matter_measurement, 'Matter and Measurement', 'matter-and-measurement', v_sub_chemistry, 'Foundations',
   'Chemistry starts by classifying matter and measuring mass, volume, temperature, and concentration.',
   'Reliable measurement is the basis of every chemical experiment.',
   ARRAY['Lab setup', 'Unit conversion', 'Solution prep', 'Data collection'], 1, 0, 0),
  (v_atomic_structure, 'Atomic Structure', 'atomic-structure', v_sub_chemistry, 'Foundations',
   'Atomic structure covers protons, neutrons, electrons, isotopes, and electron arrangement.',
   'It explains why elements behave differently and how matter is built.',
   ARRAY['Reading the periodic table', 'Spectroscopy', 'Isotopes', 'Bonding models'], 1, 0, 0),
  (v_periodic_table, 'Periodic Table', 'periodic-table', v_sub_chemistry, 'General Chemistry',
   'The periodic table organizes elements by atomic number and repeating chemical properties.',
   'It helps predict reactivity, bonding, and trends across elements.',
   ARRAY['Predicting properties', 'Comparing elements', 'Identifying groups', 'Lab reference'], 2, 0, 0),
  (v_chemical_bonding, 'Chemical Bonding', 'chemical-bonding', v_sub_chemistry, 'General Chemistry',
   'Chemical bonding explains how atoms form ionic, covalent, and metallic bonds.',
   'Bonding determines the structure and behavior of molecules and materials.',
   ARRAY['Molecule models', 'Material properties', 'Drug design', 'Biomolecule structure'], 2, 0, 0),
  (v_stoichiometry, 'Stoichiometry', 'stoichiometry', v_sub_chemistry, 'Calculations',
   'Stoichiometry uses balanced equations to relate amounts of reactants and products.',
   'It turns chemical ideas into quantitative predictions.',
   ARRAY['Yield calculations', 'Industrial chemistry', 'Lab work', 'Reaction planning'], 3, 0, 0),
  (v_chemical_reactions, 'Chemical Reactions', 'chemical-reactions', v_sub_chemistry, 'General Chemistry',
   'Chemical reactions describe how substances transform through bond breaking and bond forming.',
   'Understanding reactions is central to synthesis, metabolism, and materials science.',
   ARRAY['Combustion', 'Corrosion', 'Synthesis', 'Manufacturing'], 3, 0, 0),
  (v_thermochemistry, 'Thermochemistry', 'thermochemistry', v_sub_chemistry, 'Physical Chemistry',
   'Thermochemistry studies heat changes during reactions and physical processes.',
   'It connects chemistry to energy, spontaneity, and efficiency.',
   ARRAY['Calorimetry', 'Fuel analysis', 'Reaction energetics', 'Process design'], 4, 0, 0),
  (v_acids_bases, 'Acids and Bases', 'acids-and-bases', v_sub_chemistry, 'General Chemistry',
   'Acid-base chemistry covers pH, proton transfer, neutralization, and buffers.',
   'It matters in biology, environmental systems, and industrial processes.',
   ARRAY['Buffers', 'Water quality', 'Digestion', 'Titrations'], 4, 0, 0),
  (v_organic_chemistry, 'Organic Chemistry', 'organic-chemistry', v_sub_chemistry, 'Organic Chemistry',
   'Organic chemistry studies carbon compounds, functional groups, and reaction patterns.',
   'It is essential for fuels, plastics, medicine, and biomolecules.',
   ARRAY['Medicines', 'Polymers', 'Fuels', 'Metabolism'], 5, 0, 0),
  (v_biochemistry, 'Biochemistry', 'biochemistry', v_sub_chemistry, 'Biochemistry',
   'Biochemistry studies the chemistry of living systems, including enzymes, metabolism, and biomolecules.',
   'It is the bridge between chemistry and biology.',
   ARRAY['Enzyme function', 'Metabolism', 'Medical science', 'Biotech'], 5, 0, 0);

-- Biology
INSERT INTO nodes (id, title, slug, subject_id, topic, description, why_it_matters, use_cases, difficulty, position_x, position_y) VALUES
  (v_biomolecules, 'Biomolecules', 'biomolecules', v_sub_biology, 'Foundations',
   'Biomolecules include carbohydrates, lipids, proteins, and nucleic acids.',
   'They are the chemical building blocks of cells and life processes.',
   ARRAY['Nutrition', 'Cell structure', 'Genetics', 'Metabolism'], 1, 0, 0),
  (v_cell_structure, 'Cell Structure', 'cell-structure', v_sub_biology, 'Cell Biology',
   'Cells contain membranes, organelles, and internal systems that support life.',
   'Cell structure is the foundation for understanding how organisms function.',
   ARRAY['Microscopy', 'Medicine', 'Botany', 'Microbiology'], 1, 0, 0),
  (v_dna_genetics, 'DNA and Genetics', 'dna-and-genetics', v_sub_biology, 'Genetics',
   'DNA stores hereditary information and genetics explains how traits are passed on.',
   'Genetics drives inheritance, variation, and modern biotechnology.',
   ARRAY['Family traits', 'Genetic testing', 'Breeding', 'Biotech'], 2, 0, 0),
  (v_cell_division, 'Cell Division', 'cell-division', v_sub_biology, 'Cell Biology',
   'Cell division includes mitosis and meiosis for growth, repair, and reproduction.',
   'It connects cell structure to development and inheritance.',
   ARRAY['Growth', 'Wound healing', 'Cancer research', 'Reproduction'], 2, 0, 0),
  (v_evolution, 'Evolution', 'evolution', v_sub_biology, 'Evolutionary Biology',
   'Evolution explains how populations change over generations through variation and selection.',
   'It provides the unifying framework for modern biology.',
   ARRAY['Natural selection', 'Antibiotic resistance', 'Biodiversity', 'Adaptation'], 3, 0, 0),
  (v_photosynthesis, 'Photosynthesis', 'photosynthesis', v_sub_biology, 'Plant Biology',
   'Photosynthesis converts light energy into chemical energy stored in sugars.',
   'It powers most food webs and links sunlight to life on Earth.',
   ARRAY['Plant growth', 'Agriculture', 'Carbon cycle', 'Ecosystems'], 3, 0, 0),
  (v_homeostasis, 'Homeostasis', 'homeostasis', v_sub_biology, 'Physiology',
   'Homeostasis is the regulation of internal conditions such as temperature, water, and pH.',
   'Stable internal conditions are required for cells and organisms to survive.',
   ARRAY['Body temperature', 'Blood sugar control', 'Osmoregulation', 'Health science'], 4, 0, 0),
  (v_ecology, 'Ecology', 'ecology', v_sub_biology, 'Ecology',
   'Ecology studies how organisms interact with each other and with their environments.',
   'It helps explain ecosystems, biodiversity, and environmental change.',
   ARRAY['Conservation', 'Food webs', 'Climate impacts', 'Population management'], 4, 0, 0),
  (v_human_physiology, 'Human Physiology', 'human-physiology', v_sub_biology, 'Physiology',
   'Human physiology studies how body systems work together to maintain life.',
   'It connects biology to medicine, exercise, and health.',
   ARRAY['Medicine', 'Sports science', 'Nursing', 'Public health'], 5, 0, 0),
  (v_molecular_biology, 'Molecular Biology', 'molecular-biology', v_sub_biology, 'Molecular Biology',
   'Molecular biology explores gene expression, protein synthesis, and regulation at the molecular level.',
   'It is central to biotechnology, disease research, and modern genetics.',
   ARRAY['PCR', 'Gene regulation', 'Biotech', 'Medical research'], 5, 0, 0);

INSERT INTO edges (source_node_id, target_node_id, relationship_type) VALUES
  -- Mathematics
  (v_basic_arithmetic, v_fractions, 'leads_to'),
  (v_basic_arithmetic, v_algebra, 'leads_to'),
  (v_fractions, v_algebra, 'leads_to'),
  (v_basic_geometry, v_trigonometry, 'leads_to'),
  (v_basic_geometry, v_vectors, 'leads_to'),
  (v_algebra, v_functions, 'leads_to'),
  (v_functions, v_limits, 'leads_to'),
  (v_functions, v_matrices, 'related_to'),
  (v_trigonometry, v_limits, 'used_in'),
  (v_trigonometry, v_vectors, 'related_to'),
  (v_limits, v_derivatives, 'leads_to'),
  (v_derivatives, v_integration, 'related_to'),
  (v_vectors, v_matrices, 'leads_to'),
  (v_derivatives, v_differential_eq, 'leads_to'),
  (v_integration, v_differential_eq, 'leads_to'),
  (v_integration, v_multivariable_calc, 'leads_to'),
  (v_derivatives, v_multivariable_calc, 'leads_to'),
  (v_matrices, v_linear_algebra, 'leads_to'),
  (v_multivariable_calc, v_real_analysis, 'leads_to'),
  (v_linear_algebra, v_abstract_algebra, 'leads_to'),
  (v_differential_eq, v_real_analysis, 'related_to'),

  -- Physics
  (v_measurement, v_basic_motion, 'leads_to'),
  (v_basic_motion, v_velocity, 'leads_to'),
  (v_velocity, v_acceleration, 'leads_to'),
  (v_basic_motion, v_gravity, 'related_to'),
  (v_acceleration, v_force, 'leads_to'),
  (v_gravity, v_force, 'explains'),
  (v_force, v_newtons_laws, 'leads_to'),
  (v_force, v_energy, 'related_to'),
  (v_newtons_laws, v_energy, 'leads_to'),
  (v_newtons_laws, v_momentum, 'leads_to'),
  (v_energy, v_thermodynamics, 'leads_to'),
  (v_energy, v_waves, 'related_to'),
  (v_force, v_electromagnetism, 'related_to'),
  (v_momentum, v_waves, 'leads_to'),
  (v_waves, v_quantum_intro, 'leads_to'),
  (v_electromagnetism, v_quantum_intro, 'related_to'),
  (v_electromagnetism, v_special_relativity, 'leads_to'),
  (v_thermodynamics, v_special_relativity, 'related_to'),

  -- Chemistry
  (v_matter_measurement, v_atomic_structure, 'leads_to'),
  (v_matter_measurement, v_periodic_table, 'used_in'),
  (v_atomic_structure, v_periodic_table, 'leads_to'),
  (v_atomic_structure, v_chemical_bonding, 'leads_to'),
  (v_periodic_table, v_chemical_bonding, 'explains'),
  (v_chemical_bonding, v_stoichiometry, 'used_in'),
  (v_stoichiometry, v_chemical_reactions, 'leads_to'),
  (v_chemical_reactions, v_thermochemistry, 'leads_to'),
  (v_chemical_reactions, v_acids_bases, 'leads_to'),
  (v_chemical_bonding, v_organic_chemistry, 'leads_to'),
  (v_organic_chemistry, v_biochemistry, 'leads_to'),
  (v_thermochemistry, v_biochemistry, 'related_to'),

  -- Biology
  (v_biomolecules, v_cell_structure, 'leads_to'),
  (v_biomolecules, v_dna_genetics, 'leads_to'),
  (v_cell_structure, v_cell_division, 'leads_to'),
  (v_dna_genetics, v_cell_division, 'explains'),
  (v_dna_genetics, v_evolution, 'leads_to'),
  (v_cell_division, v_evolution, 'used_in'),
  (v_biomolecules, v_photosynthesis, 'used_in'),
  (v_cell_structure, v_homeostasis, 'leads_to'),
  (v_photosynthesis, v_ecology, 'leads_to'),
  (v_evolution, v_ecology, 'related_to'),
  (v_homeostasis, v_human_physiology, 'leads_to'),
  (v_dna_genetics, v_molecular_biology, 'leads_to'),
  (v_molecular_biology, v_human_physiology, 'related_to'),

  -- Cross-subject
  (v_derivatives, v_velocity, 'application_of'),
  (v_derivatives, v_acceleration, 'application_of'),
  (v_integration, v_energy, 'application_of'),
  (v_vectors, v_force, 'application_of'),
  (v_differential_eq, v_waves, 'application_of'),
  (v_linear_algebra, v_quantum_intro, 'application_of'),
  (v_trigonometry, v_waves, 'used_in'),
  (v_algebra, v_stoichiometry, 'application_of'),
  (v_quantum_intro, v_atomic_structure, 'explains'),
  (v_thermodynamics, v_thermochemistry, 'application_of'),
  (v_chemical_bonding, v_biomolecules, 'explains'),
  (v_organic_chemistry, v_biomolecules, 'related_to'),
  (v_biochemistry, v_cell_structure, 'explains'),
  (v_biochemistry, v_molecular_biology, 'related_to'),
  (v_energy, v_photosynthesis, 'related_to'),
  (v_acids_bases, v_homeostasis, 'related_to');

INSERT INTO prerequisites (node_id, prerequisite_node_id) VALUES
  -- Mathematics
  (v_fractions, v_basic_arithmetic),
  (v_algebra, v_basic_arithmetic),
  (v_algebra, v_fractions),
  (v_functions, v_algebra),
  (v_trigonometry, v_basic_geometry),
  (v_vectors, v_basic_geometry),
  (v_limits, v_functions),
  (v_derivatives, v_limits),
  (v_integration, v_derivatives),
  (v_matrices, v_vectors),
  (v_differential_eq, v_derivatives),
  (v_differential_eq, v_integration),
  (v_multivariable_calc, v_integration),
  (v_linear_algebra, v_matrices),
  (v_real_analysis, v_multivariable_calc),
  (v_abstract_algebra, v_linear_algebra),

  -- Physics
  (v_basic_motion, v_measurement),
  (v_velocity, v_basic_motion),
  (v_acceleration, v_velocity),
  (v_force, v_acceleration),
  (v_newtons_laws, v_force),
  (v_energy, v_force),
  (v_momentum, v_newtons_laws),
  (v_thermodynamics, v_energy),
  (v_electromagnetism, v_force),
  (v_waves, v_energy),
  (v_quantum_intro, v_waves),
  (v_special_relativity, v_electromagnetism),

  -- Chemistry
  (v_atomic_structure, v_matter_measurement),
  (v_periodic_table, v_atomic_structure),
  (v_chemical_bonding, v_atomic_structure),
  (v_chemical_bonding, v_periodic_table),
  (v_stoichiometry, v_chemical_bonding),
  (v_chemical_reactions, v_stoichiometry),
  (v_thermochemistry, v_chemical_reactions),
  (v_acids_bases, v_chemical_reactions),
  (v_organic_chemistry, v_chemical_bonding),
  (v_biochemistry, v_organic_chemistry),

  -- Biology
  (v_cell_structure, v_biomolecules),
  (v_dna_genetics, v_biomolecules),
  (v_cell_division, v_cell_structure),
  (v_cell_division, v_dna_genetics),
  (v_evolution, v_dna_genetics),
  (v_photosynthesis, v_biomolecules),
  (v_homeostasis, v_cell_structure),
  (v_ecology, v_evolution),
  (v_ecology, v_photosynthesis),
  (v_human_physiology, v_homeostasis),
  (v_molecular_biology, v_dna_genetics),
  (v_molecular_biology, v_biochemistry);

INSERT INTO mastery_tests (id, node_id, title, instructions, passing_score) VALUES
  (v_test_arithmetic, v_basic_arithmetic, 'Basic Arithmetic Test', 'Test your understanding of basic arithmetic operations.', 70),
  (v_test_functions, v_functions, 'Functions Mastery Test', 'Test your understanding of mathematical functions.', 70),
  (v_test_derivatives, v_derivatives, 'Derivatives Mastery Test', 'Test your understanding of derivatives.', 70),
  (v_test_velocity, v_velocity, 'Velocity Mastery Test', 'Test your understanding of velocity and motion.', 70),
  (v_test_newtons, v_newtons_laws, 'Newton''s Laws Test', 'Test your understanding of Newton''s three laws.', 70),
  (v_test_atomic_structure, v_atomic_structure, 'Atomic Structure Test', 'Test your understanding of atoms and subatomic structure.', 70),
  (v_test_cell_structure, v_cell_structure, 'Cell Structure Test', 'Test your understanding of the main parts of a cell.', 70);

INSERT INTO mastery_questions (id, mastery_test_id, question_type, prompt, explanation, order_index) VALUES
  (v_q_arith_1, v_test_arithmetic, 'multiple_choice', 'What is the correct order of operations for 3 + 4 * 2?', 'Multiply first, then add: 3 + 8 = 11.', 1),
  (v_q_arith_2, v_test_arithmetic, 'short_answer', 'What is 144 / 12?', '144 divided by 12 equals 12.', 2),
  (v_q_arith_3, v_test_arithmetic, 'multiple_choice', 'Which property says a + b = b + a?', 'That is the commutative property.', 3),
  (v_q_func_1, v_test_functions, 'multiple_choice', 'What is a function in mathematics?', 'A function assigns exactly one output to each input.', 1),
  (v_q_func_2, v_test_functions, 'short_answer', 'If f(x) = 2x + 3, what is f(5)?', 'f(5) = 13.', 2),
  (v_q_func_3, v_test_functions, 'multiple_choice', 'Which is NOT a standard type of function?', 'Circular is not a standard category here.', 3),
  (v_q_deriv_1, v_test_derivatives, 'multiple_choice', 'What is the derivative of x^3?', 'Use the power rule: 3x^2.', 1),
  (v_q_deriv_2, v_test_derivatives, 'multiple_choice', 'Geometrically, what does a derivative represent?', 'It is the slope of the tangent line.', 2),
  (v_q_deriv_3, v_test_derivatives, 'short_answer', 'What is the derivative of 5x^2 + 3x - 7?', 'The derivative is 10x + 3.', 3),
  (v_q_vel_1, v_test_velocity, 'multiple_choice', 'What is the key difference between speed and velocity?', 'Velocity includes direction while speed does not.', 1),
  (v_q_vel_2, v_test_velocity, 'short_answer', 'A car travels 150 km north in 2 hours. What is its average velocity?', 'Average velocity is 75 km/h north.', 2),
  (v_q_vel_3, v_test_velocity, 'multiple_choice', 'Instantaneous velocity is defined as:', 'It is the derivative of position with respect to time.', 3),
  (v_q_newton_1, v_test_newtons, 'multiple_choice', 'Newton''s First Law is the law of:', 'It is the law of inertia.', 1),
  (v_q_newton_2, v_test_newtons, 'short_answer', 'Using F = ma, what force accelerates a 5 kg object at 3 m/s^2?', 'The force is 15 N.', 2),
  (v_q_newton_3, v_test_newtons, 'multiple_choice', 'Which example best shows Newton''s Third Law?', 'A swimmer pushes water backward and moves forward.', 3),
  (v_q_atom_1, v_test_atomic_structure, 'multiple_choice', 'What is the smallest unit of an element that still retains that element''s identity?', 'That unit is the atom.', 1),
  (v_q_atom_2, v_test_atomic_structure, 'multiple_choice', 'Which subatomic particle has a positive charge?', 'Protons carry positive charge.', 2),
  (v_q_atom_3, v_test_atomic_structure, 'multiple_choice', 'What determines which element an atom is?', 'An element is defined by its number of protons.', 3),
  (v_q_cell_1, v_test_cell_structure, 'multiple_choice', 'Which organelle is often called the powerhouse of the cell?', 'Mitochondria release usable energy for the cell.', 1),
  (v_q_cell_2, v_test_cell_structure, 'multiple_choice', 'What structure surrounds the cell and controls what enters and leaves?', 'That role belongs to the cell membrane.', 2),
  (v_q_cell_3, v_test_cell_structure, 'multiple_choice', 'In a eukaryotic cell, where is most genetic material stored?', 'Most genetic material is stored in the nucleus.', 3);

INSERT INTO mastery_question_options (question_id, option_text, is_correct, order_index) VALUES
  (v_q_arith_1, '11', true, 1),
  (v_q_arith_1, '14', false, 2),
  (v_q_arith_1, '10', false, 3),
  (v_q_arith_1, '7', false, 4),
  (v_q_arith_3, 'Commutative property', true, 1),
  (v_q_arith_3, 'Associative property', false, 2),
  (v_q_arith_3, 'Distributive property', false, 3),
  (v_q_arith_3, 'Identity property', false, 4),
  (v_q_func_1, 'A relation that assigns exactly one output to each input', true, 1),
  (v_q_func_1, 'Any equation with two variables', false, 2),
  (v_q_func_1, 'A relation where inputs can have multiple outputs', false, 3),
  (v_q_func_1, 'An equation that always equals zero', false, 4),
  (v_q_func_3, 'Linear', false, 1),
  (v_q_func_3, 'Quadratic', false, 2),
  (v_q_func_3, 'Circular', true, 3),
  (v_q_func_3, 'Exponential', false, 4),
  (v_q_deriv_1, '3x^2', true, 1),
  (v_q_deriv_1, 'x^2', false, 2),
  (v_q_deriv_1, '3x^3', false, 3),
  (v_q_deriv_1, '2x^3', false, 4),
  (v_q_deriv_2, 'The area under the curve', false, 1),
  (v_q_deriv_2, 'The slope of the tangent line', true, 2),
  (v_q_deriv_2, 'The y-intercept', false, 3),
  (v_q_deriv_2, 'The maximum value', false, 4),
  (v_q_vel_1, 'Velocity includes direction, speed does not', true, 1),
  (v_q_vel_1, 'Speed is always greater', false, 2),
  (v_q_vel_1, 'They are the same thing', false, 3),
  (v_q_vel_1, 'Velocity only applies to circular motion', false, 4),
  (v_q_vel_3, 'Total distance divided by total time', false, 1),
  (v_q_vel_3, 'The derivative of position with respect to time', true, 2),
  (v_q_vel_3, 'The integral of acceleration', false, 3),
  (v_q_vel_3, 'The average of initial and final velocity', false, 4),
  (v_q_newton_1, 'Inertia', true, 1),
  (v_q_newton_1, 'Acceleration', false, 2),
  (v_q_newton_1, 'Gravity', false, 3),
  (v_q_newton_1, 'Momentum', false, 4),
  (v_q_newton_3, 'A ball rolling to a stop', false, 1),
  (v_q_newton_3, 'A swimmer pushes water backward and moves forward', true, 2),
  (v_q_newton_3, 'A heavier object falls faster', false, 3),
  (v_q_newton_3, 'An object at rest stays at rest', false, 4),
  (v_q_atom_1, 'Atom', true, 1),
  (v_q_atom_1, 'Molecule', false, 2),
  (v_q_atom_1, 'Compound', false, 3),
  (v_q_atom_1, 'Solution', false, 4),
  (v_q_atom_2, 'Electron', false, 1),
  (v_q_atom_2, 'Proton', true, 2),
  (v_q_atom_2, 'Neutron', false, 3),
  (v_q_atom_2, 'Photon', false, 4),
  (v_q_atom_3, 'The number of neutrons', false, 1),
  (v_q_atom_3, 'The number of protons in the nucleus', true, 2),
  (v_q_atom_3, 'The number of electron shells', false, 3),
  (v_q_atom_3, 'The total atomic mass rounded down', false, 4),
  (v_q_cell_1, 'Ribosome', false, 1),
  (v_q_cell_1, 'Mitochondrion', true, 2),
  (v_q_cell_1, 'Golgi apparatus', false, 3),
  (v_q_cell_1, 'Lysosome', false, 4),
  (v_q_cell_2, 'Cell membrane', true, 1),
  (v_q_cell_2, 'Nucleus', false, 2),
  (v_q_cell_2, 'Cytoplasm', false, 3),
  (v_q_cell_2, 'Cell wall', false, 4),
  (v_q_cell_3, 'Vacuole', false, 1),
  (v_q_cell_3, 'Nucleus', true, 2),
  (v_q_cell_3, 'Ribosome', false, 3),
  (v_q_cell_3, 'Mitochondrion', false, 4);

END $$;
