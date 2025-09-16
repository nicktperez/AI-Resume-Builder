export interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  result: string;
}

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
}

export default function TestimonialCarousel({ testimonials }: TestimonialCarouselProps) {
  return (
    <div className="testimonial-carousel" role="region" aria-label="Customer testimonials">
      <div className="testimonial-track">
        {testimonials.map((testimonial) => (
          <article key={testimonial.name} className="testimonial-card">
            <p className="testimonial-quote">“{testimonial.quote}”</p>
            <div className="testimonial-meta">
              <div>
                <p className="testimonial-name">{testimonial.name}</p>
                <p className="testimonial-role">
                  {testimonial.role} · {testimonial.company}
                </p>
              </div>
              <span className="testimonial-result">{testimonial.result}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
