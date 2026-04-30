import React from 'react';
import { 
  Check, 
  Zap, 
  Shield, 
  Globe, 
  ArrowRight, 
  Star,
  Smartphone,
  BarChart3,
  Users2,
  Store
} from 'lucide-react';

const PricingPage = () => {
  const plans = [
    {
      name: "Starter",
      tagline: "ເໝາະສຳລັບເຈົ້າຂອງຮ້ານໃນສາຂາດຽວ",
      price: "199,000",
      currency: "₭",
      period: "/ເດືອນ",
      features: [
        "1 ສາຂາ",
        "ສິນຄ້າໄດ້ຄວາມໄມ່ຈຳກັດ",
        "ລາຍງານການຂາຍພື້ນຖານ",
        "ໃຊ້ແອັບ POS ບນໂທລະສັບ",
        "2 ບັນຊີພະນັກງານ",
        "ສະຫຼັກມາດຕະຖານ"
      ],
      buttonText: "ເລີ່ມຕົ້ນ",
      recommended: false,
      color: "#64748b"
    },
    {
      name: "Business",
      tagline: "ເຄື່ອງມືເພີ່ມເຕີມ ແລະ ພະລັງສຳລັບການເຕີບໂຕ",
      price: "499,000",
      currency: "₭",
      period: "/ເດືອນ",
      features: [
        "ສູງສຸດ 5 ສາຂາ",
        "ສູນການຕະຫຼາດພື້ນຖານ",
        "ລະບົບຄູປອງ ແລະ ໂປຣໂມຊັນ",
        "ການພະຍາກອນສະຕັອກ",
        "10 ບັນຊີພະນັກງານ",
        "ສະຫຼັກດ່ວນ 24/7",
        "ກຳນົດຂໍ້ມູນໃບເສຣັດໂດຍຕົວເອງ",
        "ການຈັດການສະກຸນເງິນຫຼາຍ"
      ],
      buttonText: "ເລືອກ Business",
      recommended: true,
      color: "#3b82f6"
    },
    {
      name: "Enterprise",
      tagline: "ພະລັງເຕັມສຳລັບເຄືອຂ່າຍຮ້ານ",
      price: "999,000",
      currency: "₭",
      period: "/ເດືອນ",
      features: [
        "ສາຂາໄມ່ຈຳກັດ",
        "ຂໍ້ມູນເຄືອຂ່າຍທົ່ວໂລກ",
        "ບັນທຶກການກວດສອບ ແລະ ຄວາມປອດໄພ",
        "ໃຊ້ API ສຳລັບ ERP",
        "ບັນຊີພະນັກງານໄມ່ຈຳກັດ",
        "ຜູ້ຈັດການບັນຊີສ່ວນຕົວ",
        "Custom Domain",
        "White-label POS App"
      ],
      buttonText: "ຕິດຕໍ່ທີມຂາຍ",
      recommended: false,
      color: "#1e293b"
    }
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '80px 20px', fontFamily: "'Inter', sans-serif" }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '80px' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: '#dbeafe', 
          color: '#2563eb', 
          padding: '8px 16px', 
          borderRadius: '100px', 
          fontSize: '0.85rem', 
          fontWeight: 800,
          marginBottom: '24px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}>
          <Star size={16} fill="#2563eb" />
          <span>ໃຊ້ໂດຍທຸລະກິດເຫຼືອ 500+ ໃນລາວ</span>
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#0f172a', marginBottom: '24px' }}>
          ເລືອກແຜນທີ່ເໝາະສຳລັບ <br />
          <span style={{ color: '#3b82f6' }}>ການເຕີບໂຕຂອງທຸລະກິດທ່ານ</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6, fontWeight: 500 }}>
          ລາຄາທີ່ຍືດຫຍຸ່ນ ສຳລັບທ່ານ ເລີ່ມຈາກເລັກ ແລ ໂຕເຕີບໃຫ່ຍກັບ iPOS Pro.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '32px', 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {plans.map((plan, index) => (
          <div 
            key={index} 
            style={{ 
              background: '#fff', 
              borderRadius: '32px', 
              padding: '48px', 
              position: 'relative',
              boxShadow: plan.recommended ? '0 30px 60px -12px rgba(59, 130, 246, 0.25)' : '0 20px 40px -12px rgba(0,0,0,0.05)',
              border: plan.recommended ? '2px solid #3b82f6' : '1px solid #e2e8f0',
              transform: plan.recommended ? 'scale(1.05)' : 'scale(1)',
              zIndex: plan.recommended ? 2 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {plan.recommended && (
              <div style={{ 
                position: 'absolute', 
                top: '-20px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                background: '#3b82f6', 
                color: '#fff', 
                padding: '8px 24px', 
                borderRadius: '100px', 
                fontSize: '0.85rem', 
                fontWeight: 900,
                boxShadow: '0 10px 20px rgba(59, 130, 246, 0.3)'
              }}>
                ນິຍົມທີ່ສຸດ
              </div>
            )}

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>{plan.name}</h2>
              <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>{plan.tagline}</p>
            </div>

            <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>{plan.currency}</span>
              <span style={{ fontSize: '3.5rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em' }}>{plan.price}</span>
              <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>{plan.period}</span>
            </div>

            <button style={{ 
              width: '100%', 
              padding: '18px', 
              borderRadius: '16px', 
              fontSize: '1.1rem', 
              fontWeight: 800, 
              border: 'none', 
              cursor: 'pointer',
              background: plan.recommended ? '#3b82f6' : '#f1f5f9',
              color: plan.recommended ? '#fff' : '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              marginBottom: '40px',
              transition: 'all 0.2s ease'
            }}>
              {plan.buttonText}
              <ArrowRight size={20} />
            </button>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '40px' }}>
              <p style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {index > 0 ? `ທຸກອະງໃນ ${plans[index-1].name}, ບວກກັບ:` : 'ຄຸນສົມບັດທີ່ສາມາດໃຊ້ໄດ້:'}
              </p>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {plan.features.map((feature, i) => (
                  <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center', color: '#334155', fontWeight: 500, fontSize: '0.95rem' }}>
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      background: '#dcfce7', 
                      color: '#16a34a', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center' 
                    }}>
                      <Check size={14} strokeWidth={4} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badges */}
      <div style={{ marginTop: '100px', textAlign: 'center' }}>
        <p style={{ color: '#64748b', fontWeight: 700, fontSize: '0.9rem', marginBottom: '40px', textTransform: 'uppercase' }}>ຟັງຊັນທີ່ຮວມຢູ່ທຸກແຜນ</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '60px', opacity: 0.6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800 }}>
            <Smartphone size={32} />
            <span>ຮອງຮັບໂທລະສັບ</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800 }}>
            <BarChart3 size={32} />
            <span>ວິເຄາະໂດຍອັດລະສັບ</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800 }}>
            <Users2 size={32} />
            <span>ຈັດການທີມງານ</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 800 }}>
            <Store size={32} />
            <span>ຫຼາຍສາຂາ</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
