import { motion } from 'framer-motion';

const logos = ['Manipal University', 'SRM Institute', 'VIT University', 'Amity University', 'BITS Pilani'];

const TrustedBy = () => (
  <section className="py-12 bg-background border-y border-border">
    <div className="max-w-7xl mx-auto px-6">
      <p className="text-center text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-8">
        Trusted by Forward-Thinking Institutions
      </p>
      <div className="flex flex-wrap items-center justify-center gap-10">
        {logos.map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-muted-foreground/40 text-lg font-bold font-heading tracking-wide"
          >
            {name}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TrustedBy;
