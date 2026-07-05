"use client";

interface OfferLogoProps {
  label?: string;
  percent?: number;
}

const OfferLogo = ({ label, percent }: OfferLogoProps) => {
  return (
    <div className="relative h-10 w-14">
      <div className="burst-badge">
        <span className="burst-text">
          {label ? label : `-${percent}%`}

        </span>
      </div>

      <style jsx>{`
        .burst-badge {
          position: absolute;
          top: -8px;
          left: -8px;
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #ff5f45 0%, #f7311e 60%, #d81e0f 100%);
      clip-path: polygon(22% 0, 28% 33%, 0 44%, 26% 63%, 14% 100%, 50% 83%, 84% 100%, 76% 65%, 100% 50%, 78% 34%, 78% 1%, 52% 24%);

          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          filter: drop-shadow(0 3px 4px rgba(0, 0, 0, 0.25));
          animation: pop 0.4s ease-out;
        }

        .burst-text {
          color: white;
          font-size: 0.7rem;
          font-weight: 800;
          text-align: center;
          line-height: 1;
          letter-spacing: -0.02em;
          transform: translate(1px, -1px);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-shadow: 0 1px 1px rgba(0, 0, 0, 0.2);
        }

        .burst-sub {
          font-size: 0.5rem;
          font-weight: 700;
          opacity: 0.9;
          margin-top: -1px;
          letter-spacing: 0.05em;
        }

        @keyframes pop {
          0% {
            transform: scale(0);
          }
          70% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default OfferLogo;



