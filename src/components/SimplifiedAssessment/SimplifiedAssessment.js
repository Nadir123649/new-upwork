import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import './SimplifiedAssessment.css';

const SimplifiedAssessment = ({ userId, onAssessmentComplete }) => {
  const [step, setStep] = useState('category');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [customGoal, setCustomGoal] = useState('');
  const [weeklyPrompts, setWeeklyPrompts] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = [
    { value: 'Work Activities', label: 'Work Activities' },
    { value: 'Personal Matters', label: 'Personal Matters' },
    { value: 'Sacramental Life', label: 'Sacramental Life' },
    { value: 'Prayer and Scripture', label: 'Prayer and Scripture' },
    { value: 'Community and Evangelization', label: 'Community and Evangelization' },
  ];

  const categoryGoals = {
    'Work Activities': [
      // Seeker Level - Simpler Activities
      { id: 28, level: "Seeker", description: "Pray for your coworkers daily", prompts: [
        "Create a list of coworkers to pray for and their intentions",
        "Spend 5 minutes each morning offering prayers for your workplace",
        "Reflect on how prayer is affecting your work relationships",
        "Share your prayer initiative with a trusted colleague"
      ]},
      { id: 29, level: "Seeker", description: "Practice Christian virtues at work", prompts: [
        "Identify one virtue (patience, kindness, etc.) to focus on this week",
        "Document situations where you successfully practiced this virtue",
        "Reflect on challenging moments and how you could improve",
        "Share your growth with a mentor or spiritual director"
      ]},
      { id: 30, level: "Seeker", description: "Integrate brief spiritual practices at work", prompts: [
        "Find moments for short prayers during your workday",
        "Create a subtle reminder for spiritual reflection (desktop background, small cross, etc.)",
        "Practice gratitude for your work opportunities",
        "End each workday with a brief examination of conscience"
      ]},
      
      // Disciple Level - Intermediate Activities
      { id: 31, level: "Disciple", description: "Lead with Catholic social principles", prompts: [
        "Study one Catholic social teaching principle relevant to your work",
        "Identify opportunities to apply this principle in your role",
        "Share insights about ethical leadership with colleagues when appropriate",
        "Document how these principles improve your work environment"
      ]},
      { id: 32, level: "Disciple", description: "Build faith-friendly professional networks", prompts: [
        "Research professional organizations that align with Catholic values",
        "Attend a networking event with a focus on ethical business practices",
        "Connect with other professionals who integrate faith in their work",
        "Plan or join a discussion about values-based leadership"
      ]},
      { id: 33, level: "Disciple", description: "Create work-faith balance initiatives", prompts: [
        "Assess your current work-faith integration challenges",
        "Develop strategies for maintaining spiritual practices during busy periods",
        "Implement boundaries that protect your spiritual life",
        "Share successful strategies with interested colleagues"
      ]},
      
      // Apostle Level - Advanced Activities
      { id: 34, level: "Apostle", description: "Develop faith-based professional mentorship", prompts: [
        "Identify opportunities to mentor others in faith-based leadership",
        "Create a framework for discussing faith and work with mentees",
        "Meet with a mentee to discuss professional challenges through a faith lens",
        "Evaluate and adjust your mentoring approach based on feedback"
      ]},
      { id: 35, level: "Apostle", description: "Launch Catholic professional initiatives", prompts: [
        "Research needs for Catholic professional development in your field",
        "Design a project or program that serves this need",
        "Gather support and resources for implementation",
        "Launch your initiative and assess its impact"
      ]},
      { id: 36, level: "Apostle", description: "Create faith-integrated business solutions", prompts: [
        "Identify a business challenge that could benefit from Catholic social teaching",
        "Develop a solution that integrates faith principles",
        "Present your approach to stakeholders",
        "Implement and monitor the effectiveness of your solution"
      ]},
    ],
    'Personal Matters': [
      // Seeker Level - Simpler Activities
      { id: 37, level: "Seeker", description: "Develop Catholic friendships", prompts: [
        "Research local Catholic groups or parish activities",
        "Attend one social event at your parish",
        "Introduce yourself to someone new at church",
        "Follow up with one person you met to build connection"
      ]},
      { id: 38, level: "Seeker", description: "Navigate social settings with faith", prompts: [
        "List social situations that challenge your faith practice",
        "Brainstorm alternative activities that align with your values",
        "Try one new faith-friendly social activity",
        "Reflect on how this change affects your spiritual life"
      ]},
      { id: 39, level: "Seeker", description: "Practice Christian charity in relationships", prompts: [
        "Identify one relationship that needs attention",
        "Pray for guidance in improving this relationship",
        "Perform one act of kindness for this person",
        "Journal about how Christian charity affects relationships"
      ]},
      
      // Disciple Level - Intermediate Activities
      { id: 40, level: "Disciple", description: "Address relationship challenges faithfully", prompts: [
        "Identify a relationship challenge and pray about it",
        "Study Catholic teaching relevant to your situation",
        "Develop a faith-based approach to address the challenge",
        "Take action while maintaining Christian principles"
      ]},
      { id: 41, level: "Disciple", description: "Build a Catholic support network", prompts: [
        "List areas where you need faith-based support",
        "Research Catholic groups that address these needs",
        "Join one group or regular activity",
        "Contribute actively to your new community"
      ]},
      { id: 42, level: "Disciple", description: "Share faith with non-practicing friends", prompts: [
        "Pray for opportunities to share your faith naturally",
        "Practice articulating your faith journey",
        "Share one aspect of your faith when appropriate",
        "Follow up on spiritual conversations with care"
      ]},
      
      // Apostle Level - Advanced Activities
      { id: 43, level: "Apostle", description: "Lead faith-based community initiatives", prompts: [
        "Identify a community need that aligns with Catholic teaching",
        "Develop a plan to address this need through faith-based action",
        "Recruit others to join your initiative",
        "Launch and guide the initiative's development"
      ]},
      { id: 44, level: "Apostle", description: "Mentor others in faith-life integration", prompts: [
        "Identify someone seeking faith-based guidance",
        "Create a framework for faith mentorship",
        "Begin regular mentoring meetings",
        "Evaluate and adapt your mentoring approach"
      ]},
      { id: 45, level: "Apostle", description: "Create faith-building events", prompts: [
        "Assess needs for faith community building",
        "Plan an event that strengthens faith connections",
        "Organize and promote the event",
        "Host the event and gather feedback for future activities"
      ]},
    ],
    'Sacramental Life': [
      { id: 1, level: "Seeker", description: "Do one Catholic activity each week", prompts: ["Light a candle at a church or cemetery", "Watch a YouTube video on Fr. Mike Schmitz (search for Eucharist, Mass, or Confession)", "Visit a Catholic church and spend 10 minutes in quiet reflection", "Listen to a Catholic podcast episode and reflect on it using CrossValidation.ai"] },
      { id: 2, level: "Seeker", description: "Attend Sunday Mass", prompts: ["Read and reflect on the Sunday Gospel before Mass", "Attend Mass one Sunday", "Talk to someone within the parish community after Mass", "Write down one key message from the homily"] },
      { id: 3, level: "Seeker", description: "Learn about the sacraments of Eucharist, Confession, and Vocation", prompts: ["Research the importance of these sacraments in the Church", "Reflect on their impact on the faith journey", "Watch a video explaining one of these sacraments", "Discuss a sacrament with a practicing Catholic friend or family member"] },
      { id: 4, level: "Disciple", description: "Attend regular Mass", prompts: ["Reflect on the Sunday Gospel and homily outside of Mass", "Attend a weekday Mass in addition to Sunday", "Review some daily Mass readings and reflect via CrossValidation.ai", "Invite a friend or family member to join you for Mass"] },
      { id: 5, level: "Disciple", description: "Create a Confession schedule", prompts: ["Pray an Act of Contrition daily", "Attend Confession", "Create a recurring Confession schedule", "Reflect on the graces received from Confession"] },
      { id: 6, level: "Disciple", description: "Spend 30 minutes in Adoration", prompts: ["Spend 30 minutes in Adoration", "Reflect on thoughts and intentions considered during Adoration", "Discuss your Adoration experience with a spiritual companion or CrossValidation.ai", "Invite someone to join you for Adoration"] },
      { id: 7, level: "Apostle", description: "Deepen your Mass participation", prompts: ["Attend two weekday Masses", "Read and meditate on the Mass readings before attending", "Volunteer as a lector or eucharistic minister", "Lead a discussion group on the Sunday readings"] },
      { id: 8, level: "Apostle", description: "Commit to regular Adoration", prompts: ["Spend an hour in Adoration twice this week", "Keep an Adoration journal and review it periodically", "Organize a group Adoration hour", "Learn about and try different prayer methods during Adoration"] },
      { id: 9, level: "Apostle", description: "Become a sacramental mentor", prompts: ["Offer to sponsor an RCIA candidate", "Help prepare children for First Communion or Confirmation", "Share your sacramental experiences in a parish talk", "Create a sacramental preparation resource with help from CrossValidation.ai"] },
    ],
    'Prayer and Scripture': [
      { id: 10, level: "Seeker", description: "Establish a daily prayer habit", prompts: ["Set aside 5 minutes each day for prayer", "Try different prayer methods (vocal, mental, contemplative)", "Use a guided prayer resource or app", "Write a reflection on your experience in prayer"] },
      { id: 11, level: "Seeker", description: "Engage with Scripture daily", prompts: ["Read a short Bible verse each day", "Use a Bible app or website for daily readings", "Learn about Lectio Divina and try it with a scripture passage", "Discuss a Bible passage with a friend or using CrossValidation.ai"] },
      { id: 12, level: "Seeker", description: "Learn about the Mysteries of the Rosary", prompts: ["Pray a decade of the Rosary", "Read about the Mysteries of the Rosary", "Pray a full Rosary", "Reflect on a Mystery using sacred art"] },
      { id: 13, level: "Disciple", description: "Deepen your prayer life", prompts: ["Extend daily prayer time to 15 minutes", "Learn and practice the Examen prayer", "Try praying with Scripture using Lectio Divina", "Share your prayer experiences with a spiritual companion or CrossValidation.ai"] },
      { id: 14, level: "Disciple", description: "Study the Sunday readings", prompts: ["Read the upcoming Sunday readings early in the week", "Use a Catholic commentary to deepen understanding", "Discuss the readings with a friend or family member", "Reflect on how the readings apply to your life"] },
      { id: 15, level: "Disciple", description: "Explore Catholic devotions", prompts: ["Learn about a new Catholic devotion (e.g., Divine Mercy, Sacred Heart)", "Practice a chosen devotion for a week", "Read about the history and significance of the devotion", "Share your experience with the devotion in a faith community or online platform"] },
      { id: 16, level: "Apostle", description: "Lead a faith study group", prompts: ["Organize a weekly prayer group or Bible study", "Prepare materials for the group", "Lead the group session", "Reflect on the group experience and plan future sessions"] },
      { id: 17, level: "Apostle", description: "Develop a comprehensive prayer routine", prompts: ["Create a 30-minute daily prayer plan", "Incorporate different prayer forms (meditation, contemplation, intercessory)", "Learn about and try praying the Liturgy of the Hours", "Share your prayer routine and insights with others"] },
      { id: 18, level: "Apostle", description: "Create a 4-week faith study program", prompts: ["Identify a good 4-week faith study program", "Customize the study for your group or community", "Implement the program, performing one task each week", "Add personal reflections on the tasks (including video or reading material)"] },
    ],
    'Community and Evangelization': [
      { id: 19, level: "Seeker", description: "Participate in a Gospel Reflection Group", prompts: ["Review the Gospel and consider its relevance to your life", "Participate in a group discussion or call", "Share your experience with another person", "Reflect on the group discussion using CrossValidation.ai or a journal"] },
      { id: 20, level: "Seeker", description: "Engage with Catholic content online", prompts: ["Follow Catholic accounts on social media", "Comment on or share an inspiring Catholic post", "Watch a Catholic YouTube video and reflect on it", "Discuss a piece of Catholic content with a friend or online community"] },
      { id: 21, level: "Seeker", description: "Explore local Catholic community", prompts: ["Research Catholic events in your area", "Attend a parish social event (e.g., coffee and donuts after Mass)", "Introduce yourself to someone new at church", "Reflect on your community experience"] },
      { id: 22, level: "Disciple", description: "Attend a YCP or local Diocese event", prompts: ["Research upcoming YCP or Diocese events", "Attend an event and meet 1-3 like-minded individuals", "Follow up with new connections and plan to attend another event together", "Share your event experience with others or on a platform like CrossValidation.ai"] },
      { id: 23, level: "Disciple", description: "Share your faith journey", prompts: ["Reflect on your personal faith journey", "Share your story with a friend or family member", "Write a blog post or social media update about your faith", "Discuss ways to share your faith with others"] },
      { id: 24, level: "Disciple", description: "Volunteer for a parish ministry", prompts: ["Research various parish ministries", "Contact a ministry leader to learn more", "Attend a ministry meeting or event", "Reflect on your ministry experience"] },
      { id: 25, level: "Apostle", description: "Organize a faith-sharing group", prompts: ["Invite friends to join a faith-sharing group", "Plan and lead the first meeting", "Facilitate group discussions on faith topics", "Use resources like CrossValidation.ai to prepare content for future meetings"] },
      { id: 26, level: "Apostle", description: "Become a Catholic mentor", prompts: ["Offer to mentor a new Catholic or RCIA candidate", "Meet with your mentee to discuss faith topics", "Share resources and experiences to support their journey", "Reflect on the mentoring experience and adjust your approach"] },
      { id: 27, level: "Apostle", description: "Attend a FOCUS Catholic Conference", prompts: ["Research FOCUS 'Making Missionary Disciples' and their study material", "Allocate time and resources for the Salt Lake City event", "Write down specific goals for attending the conference", "Attend the conference and share key takeaways with your community"] },
    ],
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setStep(category === 'custom' ? 'customGoal' : 'goal');
  };

  const handleGoalSelect = (goal) => {
    setSelectedGoal(goal);
    setWeeklyPrompts(goal.prompts);
    setStep('prompts');
  };

  const handlePromptChange = (index, value) => {
    const newPrompts = [...weeklyPrompts];
    newPrompts[index] = value;
    setWeeklyPrompts(newPrompts);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const challengeData = {
        description: selectedGoal.description,
        category: selectedCategory === 'custom' ? 'Custom' : selectedCategory,
        challenge_level: selectedGoal.level || 'Seeker',
        weekly_prompts: weeklyPrompts
      };

      await axios.post(`${API_ENDPOINTS.SUBMIT_SELECTED_CHALLENGES}/${userId}`, {
        selectedChallenges: [challengeData]
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        resetComponent();
      }, 3000);

      onAssessmentComplete();
    } catch (error) {
      console.error('Error submitting assessment:', error);
      alert('Failed to submit assessment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetComponent = () => {
    setStep('category');
    setSelectedCategory('');
    setSelectedGoal(null);
    setCustomGoal('');
    setWeeklyPrompts(['', '', '', '']);
    setApiResponse(null);
  };

  const handleBack = () => {
    switch (step) {
      case 'goal':
      case 'customGoal':
        setStep('category');
        setSelectedCategory('');
        break;
      case 'prompts':
      case 'customPrompts':
        setStep(selectedCategory === 'custom' ? 'customGoal' : 'goal');
        setSelectedGoal(null);
        setWeeklyPrompts(['', '', '', '']);
        break;
      default:
        break;
    }
  };

  const renderCategorySelection = () => (
    <div className="category-section">
      <h3>Select The Topic For Your Activity:</h3>
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => handleCategorySelect(category.value)}
        >
          {category.label}
        </button>
      ))}
      <button onClick={() => handleCategorySelect('custom')}>
        Custom Activity
      </button>
    </div>
  );

  const renderGoalSelection = () => (
    <div className="goal-section">
      <button className="back-button" onClick={handleBack}>Back</button>
      <h3>Select a goal:</h3>
      {['Seeker', 'Disciple', 'Apostle'].map((level) => (
        <div key={level}>
          <h4>{level}</h4>
          {categoryGoals[selectedCategory]
            .filter((goal) => goal.level === level)
            .map((goal) => (
              <button
                key={goal.id}
                onClick={() => handleGoalSelect(goal)}
              >
                {goal.description}
              </button>
            ))}
        </div>
      ))}
    </div>
  );

  const renderCustomGoalInput = () => (
      <div className="goal-section">
        <button className="back-button" onClick={handleBack}>Back</button>
        <h3>Enter your custom goal:</h3>
        <p className="goal-description">
          Create your own spiritual goal that aligns with your faith journey. Example: "I want to develop a daily prayer routine" or "I want to learn more about Catholic social teaching."
        </p>
        <input
          type="text"
          value={customGoal}
          onChange={(e) => setCustomGoal(e.target.value)}
          placeholder="Enter your custom goal"
        />
        <button
          className="submit-button"
          onClick={handleCustomGoalSubmit}
          disabled={!customGoal || isLoading}
        >
          {isLoading ? 'Generating...' : 'Generate Prompts'}
        </button>
      </div>
  );

  const handleCustomGoalSubmit = async () => {
    setIsLoading(true);
    try {
      console.log('Sending custom goal to API:', customGoal);
      const response = await axios.post(`${API_ENDPOINTS.GENERATE_PROMPTS}/${userId}`, { input: customGoal });
      console.log('API Response:', response.data);
      setApiResponse(response.data);
      setSelectedGoal({ 
        description: response.data.recommended_goal, 
        challenge_level: response.data.challenge_level 
      });
      if (response.data.weekly_tasks && response.data.weekly_tasks.length > 0) {
        setWeeklyPrompts(response.data.weekly_tasks);
      } else {
        console.error('No weekly tasks received from API');
        setWeeklyPrompts(['', '', '', '']);
      }
      setStep('customPrompts');
    } catch (error) {
      console.error('Error generating prompts:', error);
      alert('Failed to generate prompts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPrompts = () => (
      <div className="prompt-section">
        <button className="back-button" onClick={handleBack}>Back</button>
        <h3>Your Goal:</h3>
        <p>{selectedGoal.description}</p>
        <h3>Weekly Prompts:</h3>
        <p className="prompts-description">
          Below are your weekly tasks. Each week, you'll focus on one of these prompts and reflect on your progress through the app. You can modify these prompts to better fit your spiritual journey.
        </p>
        {weeklyPrompts.map((prompt, index) => (
          <textarea
            key={index}
            value={prompt}
            onChange={(e) => handlePromptChange(index, e.target.value)}
            placeholder={`Week ${index + 1} prompt`}
          />
        ))}
        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Submitting...' : 'Submit Assessment'}
        </button>
      </div>
  );


  return (
    <div className="simplified-assessment">
      {showSuccess ? (
        <div className="success-message">
          <p>Challenge added successfully! Check in anytime during the week and at least once by Sunday. Reflections and progress will be integrated into your spiritual direction AI.</p>
        </div>
      ) : (
        <>
          {step === 'category' && renderCategorySelection()}
          {step === 'goal' && renderGoalSelection()}
          {step === 'customGoal' && renderCustomGoalInput()}
          {(step === 'prompts' || step === 'customPrompts') && renderPrompts()}
        </>
      )}
    </div>
  );
};

export default SimplifiedAssessment;

