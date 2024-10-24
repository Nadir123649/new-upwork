import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import axios from 'axios';

const MySwal = withReactContent(Swal);

const WebsiteTour = ({ userId }) => {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const checkTourStatus = async () => {
      if (userId) {
        try {
          const response = await axios.get(`http://localhost:5052/check_tour_status?user_id=${userId}`);
          setShowTour(!response.data.never_see_again);
        } catch (error) {
          console.error('Error checking tour status:', error);
          setShowTour(true);
        }
      }
    };
    checkTourStatus();
  }, [userId]);

  const updateTourStatus = async (neverSeeAgain) => {
    try {
      await axios.post('http://localhost:5052/update_tour_status', {
        user_id: userId,
        never_see_again: neverSeeAgain
      });
    } catch (error) {
      console.error('Error updating tour status:', error);
    }
  };

  const runTour = async () => {
    const steps = [
      {
        title: 'Welcome to Catholic Spiritual Direction AI',
        html: `
          <div class="tour-step">
            <h3>Personalized Gospel Reflections for Your Faith Journey</h3>
            <p>Our AI-powered application provides daily Catholic spiritual guidance, integrating Gospel readings with your personal and professional life experiences.</p>
          </div>
        `,
        confirmButtonText: 'Next'
      },
      {
        title: 'Daily Gospel Reflections',
        html: `
          <div class="tour-step">
            <h3>Deepen Your Faith with Daily Readings</h3>
            <div class="tour-list">
              <div class="tour-list-item">
                <span class="tour-bullet">•</span>
                <span class="tour-text">Receive reflections based on daily Catholic Gospel readings</span>
              </div>
              <div class="tour-list-item">
                <span class="tour-bullet">•</span>
                <span class="tour-text">Gain insights tailored to your personal and professional background</span>
              </div>
            </div>
            <p>Our AI spiritual director helps you apply Gospel teachings to your daily life and challenges.</p>
          </div>
        `,
        confirmButtonText: 'Next'
      },
      {
        title: 'Personalized Experience',
        html: `
          <div class="tour-step">
            <h3>Tailored Guidance for Your Unique Journey</h3>
            <p>As a paid subscriber, you can create a detailed personal and professional background during registration. Our AI uses this information to provide more relevant and insightful spiritual guidance.</p>
          </div>
        `,
        confirmButtonText: 'Next'
      },
      {
        title: 'Subscription Options',
        html: `
          <div class="tour-step">
            <h3>Choose the Plan That Fits Your Needs</h3>
            <p>Start with 3 free reflections to experience our service. For unlimited access to personalized spiritual guidance, subscribe for just $10/month.</p>
          </div>
        `,
        confirmButtonText: 'Next'
      },
      {
        title: 'Start Your Spiritual Journey',
        html: `
          <div class="tour-step">
            <h3>Grow in Faith with AI-Assisted Spiritual Direction</h3>
            <p>Whether you're seeking daily inspiration or guidance through life's challenges, our AI spiritual director is here to support your Catholic faith journey.</p>
            <p>Begin your experience now by asking for a reflection on today's Gospel reading!</p>
          </div>
        `,
        confirmButtonText: 'Get Started'
      }
    ];

    for (let i = 0; i < steps.length; i++) {
      const result = await MySwal.fire({
        ...steps[i],
        showCancelButton: true,
        cancelButtonText: i === 0 ? 'Never show again' : 'Close tour',
        customClass: {
          container: 'tour-container',
          popup: 'tour-popup',
          header: 'tour-header',
          title: 'tour-title',
          closeButton: 'tour-close-button',
          content: 'tour-content',
          htmlContainer: 'tour-html-container',
          confirmButton: 'tour-confirm-button',
          cancelButton: 'tour-cancel-button'
        }
      });

      if (result.dismiss === Swal.DismissReason.cancel) {
        if (i === 0) {
          await updateTourStatus(true);
        }
        break;
      }
    }
    setShowTour(false);
  };

  useEffect(() => {
    if (showTour) {
      runTour();
    }
  }, [showTour]);

  return null;
};

export default WebsiteTour;